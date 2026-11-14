import { isValidAvatar, getAvatarSignature } from "./avatarSchema.js";
import { ALLOWED_CATEGORIES, normalizeWord, pickSecretWord } from "./words.js";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;
const RECONNECT_WINDOW_MS = 60_000;
const GUESS_PHASE_SECONDS = 20;
const VOTE_RESULT_DELAY_MS = 4_200;
const ALLOWED_TIMES = [30, 45, 60];
const ALLOWED_DEBATE_TIMES = [30, 45, 60, 90];
const MAX_CHAT_MESSAGES = 100;
const ROOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getGlobalStore() {
  if (!globalThis.__impostorPartyStore) {
    globalThis.__impostorPartyStore = {
      rooms: new Map(),
      socketToSession: new Map(), // socketId -> { playerId, roomCode }
      disconnectTimers: new Map(), // `${roomCode}:${playerId}` -> Timeout
      phaseTimers: new Map(), // roomCode -> Timeout
      attachedServers: new WeakSet(),
    };
  }
  return globalThis.__impostorPartyStore;
}

function generateRoomCode(rooms) {
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)];
    }
    if (!rooms.has(code)) return code;
  }
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function sanitizeNickname(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15);
}

function sanitizePlayerId(raw) {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (trimmed.length < 6 || trimmed.length > 80) return "";
  return trimmed;
}

function clearPhaseTimer(roomCode) {
  const { phaseTimers } = getGlobalStore();
  const existing = phaseTimers.get(roomCode);
  if (existing) {
    clearTimeout(existing);
    phaseTimers.delete(roomCode);
  }
}

function setPhaseTimer(roomCode, fn, delayMs) {
  clearPhaseTimer(roomCode);
  const { phaseTimers } = getGlobalStore();
  const handle = setTimeout(() => {
    phaseTimers.delete(roomCode);
    fn();
  }, delayMs);
  phaseTimers.set(roomCode, handle);
}

function clearDisconnectTimer(roomCode, playerId) {
  const { disconnectTimers } = getGlobalStore();
  const key = `${roomCode}:${playerId}`;
  const existing = disconnectTimers.get(key);
  if (existing) {
    clearTimeout(existing);
    disconnectTimers.delete(key);
  }
}

function serializePlayer(player, revealRole = false) {
  return {
    id: player.id,
    nickname: player.nickname,
    avatar: player.avatar,
    isReady: Boolean(player.isReady),
    isAlive: Boolean(player.isAlive),
    connected: Boolean(player.connected),
    ...(revealRole ? { isImpostor: Boolean(player.isImpostor) } : {}),
  };
}

export function serializeRoom(room) {
  const revealAll = room.status === "ended";
  const currentTurnPlayerId =
    room.status === "playing" && room.gameData.turnOrder.length > 0
      ? room.gameData.turnOrder[room.gameData.currentTurnIndex] || null
      : null;

  const aliveImpostorsCount = room.players.filter(
    (p) => p.isAlive && p.isImpostor
  ).length;

  return {
    roomCode: room.roomCode,
    hostId: room.hostId,
    status: room.status,
    players: room.players.map((p) =>
      serializePlayer(
        p,
        revealAll ||
          (room.status === "guess" && p.id === room.gameData.guessingImpostorId)
      )
    ),
    settings: { ...room.settings },
    gameData: {
      category: room.gameData.resolvedCategory || room.settings.category,
      totalImpostors:
        room.gameData.totalImpostors || room.settings.impostors || 1,
      aliveImpostorsCount:
        room.status === "lobby"
          ? room.settings.impostors || 1
          : aliveImpostorsCount,
      currentTurnIndex: room.gameData.currentTurnIndex,
      currentTurnPlayerId,
      turnOrder: [...room.gameData.turnOrder],
      hints: room.gameData.hints.map((h) => ({ ...h })),
      chatMessages: (room.gameData.chatMessages || []).map((m) => ({ ...m })),
      skipDebatePlayerIds: Object.keys(room.gameData.skipDebateVotes || {}),
      votedPlayerIds: Object.keys(room.gameData.votes || {}),
      round: room.gameData.round,
      phaseEndsAt: room.gameData.phaseEndsAt,
      guessingImpostorId: room.gameData.guessingImpostorId,
      lastVoteResult: room.gameData.lastVoteResult,
      ...(revealAll
        ? {
            secretWord: room.gameData.secretWord,
            resultSummary: room.gameData.resultSummary,
          }
        : {}),
    },
  };
}

function findDuplicateAvatarWarning(room, playerId, avatar) {
  const signature = getAvatarSignature(avatar);
  const twin = room.players.find(
    (p) => p.id !== playerId && getAvatarSignature(p.avatar) === signature
  );
  if (!twin) return undefined;
  return `Visual gêmeo na área! ${twin.nickname} está usando as mesmas peças de avatar que você.`;
}

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function endGame(io, room, winner, reason, guessAttempt = null) {
  clearPhaseTimer(room.roomCode);
  room.status = "ended";
  room.gameData.phaseEndsAt = null;

  const impostors = room.players.filter((p) => p.isImpostor);
  const primaryImpostorId = impostors[0]?.id || null;
  const impostorIds = impostors.map((p) => p.id);

  const summary = {
    winner, // "crew" | "impostor"
    reason,
    impostorId: primaryImpostorId,
    impostorIds,
    secretWord: room.gameData.secretWord,
    category: room.gameData.resolvedCategory,
    guessAttempt,
  };
  room.gameData.resultSummary = summary;

  io.to(room.roomCode).emit("game_over", {
    ...summary,
    room: serializeRoom(room),
  });
}

function checkMidGameWinConditions(io, room, context = {}) {
  const alivePlayers = room.players.filter((p) => p.isAlive);
  const aliveImpostors = alivePlayers.filter((p) => p.isImpostor);
  const aliveCrew = alivePlayers.filter((p) => !p.isImpostor);

  if (aliveImpostors.length === 0) {
    endGame(
      io,
      room,
      "crew",
      "Todos os impostores foram descobertos! O caso está resolvido!",
      context.guessAttempt ?? null
    );
    return true;
  }

  if (aliveCrew.length === 0) {
    endGame(
      io,
      room,
      "impostor",
      "Nenhum inocente restou na pista! Os impostores dominaram o caso!",
      context.guessAttempt ?? null
    );
    return true;
  }

  const startedCrewMajority =
    (room.gameData.initialCrewCount || 0) >
    (room.gameData.totalImpostors || 1);

  if (startedCrewMajority && aliveImpostors.length >= aliveCrew.length) {
    endGame(
      io,
      room,
      "impostor",
      "Os impostores dominaram a mesa de investigação em número de jogadores!",
      context.guessAttempt ?? null
    );
    return true;
  }

  // Modo com múltiplos impostores desde o início (ex.: 4 jogadores com 2 impostores ou 3 jogadores com 2 impostores)
  if (!startedCrewMajority) {
    if (
      context.eliminatedRole === "crew" &&
      aliveImpostors.length >= aliveCrew.length
    ) {
      endGame(
        io,
        room,
        "impostor",
        "Um inocente foi eliminado e os impostores garantiram o controle do caso!",
        context.guessAttempt ?? null
      );
      return true;
    }

    if (context.eliminatedRole === "impostor" && alivePlayers.length <= 2) {
      endGame(
        io,
        room,
        "crew",
        "O inocente resistiu ao blefe múltiplo e desmascarou um impostor! Vitória dos Inocentes!",
        context.guessAttempt ?? null
      );
      return true;
    }
  }

  return false;
}

function startVotingPhase(io, room) {
  clearPhaseTimer(room.roomCode);
  room.status = "voting";
  room.gameData.votes = {};
  room.gameData.skipDebateVotes = {};
  room.gameData.lastVoteResult = null;

  const durationSeconds = room.settings.voteTime;
  const endsAt = Date.now() + durationSeconds * 1000;
  room.gameData.phaseEndsAt = endsAt;

  io.to(room.roomCode).emit("voting_started", {
    endsAt,
    durationSeconds,
    round: room.gameData.round,
    hints: room.gameData.hints,
    room: serializeRoom(room),
  });

  setPhaseTimer(
    room.roomCode,
    () => {
      finishVotingPhase(io, room);
    },
    durationSeconds * 1000
  );
}

function startDebatePhase(io, room) {
  clearPhaseTimer(room.roomCode);
  room.status = "debate";
  room.gameData.skipDebateVotes = {};
  room.gameData.lastVoteResult = null;

  const durationSeconds = room.settings.debateTime || 45;
  const endsAt = Date.now() + durationSeconds * 1000;
  room.gameData.phaseEndsAt = endsAt;

  io.to(room.roomCode).emit("debate_started", {
    endsAt,
    durationSeconds,
    round: room.gameData.round,
    hints: room.gameData.hints,
    chatMessages: room.gameData.chatMessages,
    room: serializeRoom(room),
  });

  setPhaseTimer(
    room.roomCode,
    () => {
      startVotingPhase(io, room);
    },
    durationSeconds * 1000
  );
}

function startTurn(io, room, turnOrderIndex) {
  clearPhaseTimer(room.roomCode);

  const aliveSet = new Set(
    room.players.filter((p) => p.isAlive).map((p) => p.id)
  );
  const order = room.gameData.turnOrder;

  let nextIdx = turnOrderIndex;
  while (nextIdx < order.length && !aliveSet.has(order[nextIdx])) {
    nextIdx++;
  }

  if (nextIdx >= order.length) {
    if (room.settings.debateEnabled) {
      startDebatePhase(io, room);
    } else {
      startVotingPhase(io, room);
    }
    return;
  }

  room.status = "playing";
  room.gameData.currentTurnIndex = nextIdx;
  const activePlayerId = order[nextIdx];
  const activePlayer = room.players.find((p) => p.id === activePlayerId);

  // Se o jogador da vez estiver desconectado, usa janela reduzida de 15s para não travar a sala
  const durationSeconds =
    activePlayer && !activePlayer.connected
      ? Math.min(15, room.settings.hintTime)
      : room.settings.hintTime;
  const endsAt = Date.now() + durationSeconds * 1000;
  room.gameData.phaseEndsAt = endsAt;

  io.to(room.roomCode).emit("turn_started", {
    currentTurnPlayerId: activePlayerId,
    currentTurnIndex: nextIdx,
    round: room.gameData.round,
    endsAt,
    durationSeconds,
    room: serializeRoom(room),
  });

  setPhaseTimer(
    room.roomCode,
    () => {
      handleHintSubmission(io, room, activePlayerId, "", true);
    },
    durationSeconds * 1000
  );
}

function handleHintSubmission(io, room, playerId, rawText, timedOut = false) {
  if (room.status !== "playing") return;
  const expectedPlayerId =
    room.gameData.turnOrder[room.gameData.currentTurnIndex];
  if (expectedPlayerId !== playerId) return;

  const player = room.players.find((p) => p.id === playerId);
  if (!player || !player.isAlive) return;

  clearPhaseTimer(room.roomCode);

  const hintText = timedOut ? "(Sem dica — tempo esgotado!)" : rawText;
  const hintEntry = {
    id: `${room.gameData.round}-${playerId}-${Date.now()}`,
    playerId: player.id,
    nickname: player.nickname,
    avatar: player.avatar,
    text: hintText,
    round: room.gameData.round,
    timedOut,
  };

  room.gameData.hints.push(hintEntry);

  io.to(room.roomCode).emit("hint_received", {
    hint: hintEntry,
    hints: room.gameData.hints,
    room: serializeRoom(room),
  });

  startTurn(io, room, room.gameData.currentTurnIndex + 1);
}

function startGuessPhase(io, room, eliminatedImpostor) {
  clearPhaseTimer(room.roomCode);
  room.status = "guess";
  room.gameData.guessingImpostorId = eliminatedImpostor.id;

  const endsAt = Date.now() + GUESS_PHASE_SECONDS * 1000;
  room.gameData.phaseEndsAt = endsAt;

  io.to(room.roomCode).emit("guess_phase", {
    impostorId: eliminatedImpostor.id,
    impostorNickname: eliminatedImpostor.nickname,
    impostorAvatar: eliminatedImpostor.avatar,
    endsAt,
    durationSeconds: GUESS_PHASE_SECONDS,
    room: serializeRoom(room),
  });

  setPhaseTimer(
    room.roomCode,
    () => {
      resolveImpostorGuess(io, room, null, true);
    },
    GUESS_PHASE_SECONDS * 1000
  );
}

function resolveImpostorGuess(io, room, rawWord, timedOut = false) {
  if (room.status !== "guess") return;
  clearPhaseTimer(room.roomCode);

  const guessingPlayer = room.players.find(
    (p) => p.id === room.gameData.guessingImpostorId
  );
  const impostorName = guessingPlayer ? guessingPlayer.nickname : "O impostor";
  const cleanedGuess =
    typeof rawWord === "string" ? rawWord.trim().slice(0, 40) : "";

  const isCorrect =
    !timedOut &&
    cleanedGuess.length > 0 &&
    normalizeWord(cleanedGuess) === normalizeWord(room.gameData.secretWord);

  if (isCorrect) {
    endGame(
      io,
      room,
      "impostor",
      `Virada épica! ${impostorName} foi eliminado, mas acertou a palavra "${room.gameData.secretWord}"!`,
      cleanedGuess
    );
    return;
  }

  // Se errou ou o tempo acabou, verificamos se ainda resta algum impostor vivo
  const aliveImpostors = room.players.filter((p) => p.isAlive && p.isImpostor);

  if (aliveImpostors.length === 0) {
    const failReason = timedOut
      ? `${impostorName} deixou os 20 segundos esgotarem sem adivinhar a palavra! Vitória dos Inocentes!`
      : `${impostorName} chutou "${cleanedGuess || "..."}" e errou feio! Vitória dos Inocentes!`;
    endGame(io, room, "crew", failReason, cleanedGuess || null);
    return;
  }

  if (
    checkMidGameWinConditions(io, room, {
      eliminatedRole: "impostor",
      guessAttempt: cleanedGuess || null,
    })
  ) {
    return;
  }

  // Continua para a próxima rodada caso ainda restem impostores infiltrados
  room.gameData.guessingImpostorId = null;
  room.gameData.round += 1;
  room.gameData.turnOrder = room.players
    .filter((p) => p.isAlive)
    .map((p) => p.id);
  startTurn(io, room, 0);
}

function finishVotingPhase(io, room) {
  if (room.status !== "voting") return;
  clearPhaseTimer(room.roomCode);

  const aliveIds = new Set(
    room.players.filter((p) => p.isAlive).map((p) => p.id)
  );

  const tally = {};
  const votesByPlayer = {};

  for (const [voterId, targetId] of Object.entries(room.gameData.votes)) {
    if (!aliveIds.has(voterId)) continue;
    const key = targetId && aliveIds.has(targetId) ? targetId : "skip";
    votesByPlayer[voterId] = key;
    tally[key] = (tally[key] || 0) + 1;
  }

  const skipVotes = tally.skip || 0;
  let topVotes = 0;
  let topCandidates = [];

  for (const [candidateId, count] of Object.entries(tally)) {
    if (candidateId === "skip") continue;
    if (count > topVotes) {
      topVotes = count;
      topCandidates = [candidateId];
    } else if (count === topVotes && count > 0) {
      topCandidates.push(candidateId);
    }
  }

  let eliminatedPlayer = null;
  const isSkipped = topVotes === 0 || skipVotes >= topVotes;
  const isTie = !isSkipped && topCandidates.length > 1;

  if (!isSkipped && !isTie && topCandidates.length === 1) {
    eliminatedPlayer =
      room.players.find((p) => p.id === topCandidates[0]) || null;
    if (eliminatedPlayer) {
      eliminatedPlayer.isAlive = false;
    }
  }

  const voteResultPayload = {
    tally,
    votesByPlayer,
    eliminatedPlayerId: eliminatedPlayer ? eliminatedPlayer.id : null,
    eliminatedPlayer: eliminatedPlayer
      ? serializePlayer(eliminatedPlayer, true)
      : null,
    wasImpostor: eliminatedPlayer ? Boolean(eliminatedPlayer.isImpostor) : false,
    tie: isTie,
    skipped: isSkipped,
  };

  room.gameData.lastVoteResult = voteResultPayload;
  room.gameData.phaseEndsAt = Date.now() + VOTE_RESULT_DELAY_MS;

  io.to(room.roomCode).emit("vote_result", {
    ...voteResultPayload,
    room: serializeRoom(room),
  });

  setPhaseTimer(
    room.roomCode,
    () => {
      if (eliminatedPlayer && eliminatedPlayer.isImpostor) {
        startGuessPhase(io, room, eliminatedPlayer);
        return;
      }

      if (
        checkMidGameWinConditions(io, room, {
          eliminatedRole: eliminatedPlayer ? "crew" : null,
        })
      ) {
        return;
      }

      // Próxima rodada de dicas
      room.gameData.round += 1;
      room.gameData.lastVoteResult = null;
      room.gameData.turnOrder = room.players
        .filter((p) => p.isAlive)
        .map((p) => p.id);
      startTurn(io, room, 0);
    },
    VOTE_RESULT_DELAY_MS
  );
}

function removePlayerPermanently(io, roomCode, playerId) {
  const { rooms } = getGlobalStore();
  const room = rooms.get(roomCode);
  if (!room) return;

  clearDisconnectTimer(roomCode, playerId);

  const playerIdx = room.players.findIndex((p) => p.id === playerId);
  if (playerIdx === -1) return;

  const [removedPlayer] = room.players.splice(playerIdx, 1);

  if (room.players.length === 0) {
    clearPhaseTimer(roomCode);
    rooms.delete(roomCode);
    return;
  }

  let newHostId = undefined;
  if (room.hostId === playerId) {
    const nextHost =
      room.players.find((p) => p.connected) || room.players[0];
    room.hostId = nextHost.id;
    newHostId = nextHost.id;
  }

  // Se o jogo estava em andamento, verificar impacto da saída
  if (
    room.status === "playing" ||
    room.status === "debate" ||
    room.status === "voting" ||
    room.status === "guess"
  ) {
    if (
      room.status === "guess" &&
      room.gameData.guessingImpostorId === playerId
    ) {
      io.to(roomCode).emit("player_left", {
        playerId,
        nickname: removedPlayer.nickname,
        newHostId,
        room: serializeRoom(room),
      });
      resolveImpostorGuess(io, room, null, true);
      return;
    }

    if (
      checkMidGameWinConditions(io, room, {
        eliminatedRole: removedPlayer.isImpostor ? "impostor" : "crew",
      })
    ) {
      io.to(roomCode).emit("player_left", {
        playerId,
        nickname: removedPlayer.nickname,
        newHostId,
        room: serializeRoom(room),
      });
      return;
    }

    if (room.status === "playing") {
      const currentTurnPlayerId =
        room.gameData.turnOrder[room.gameData.currentTurnIndex];
      if (currentTurnPlayerId === playerId) {
        startTurn(io, room, room.gameData.currentTurnIndex + 1);
      }
    } else if (room.status === "debate") {
      if (room.gameData.skipDebateVotes) {
        delete room.gameData.skipDebateVotes[playerId];
      }
      const aliveConnected = room.players.filter(
        (p) => p.isAlive && p.connected
      );
      const allReadyToVote =
        aliveConnected.length > 0 &&
        aliveConnected.every(
          (p) => Boolean(room.gameData.skipDebateVotes?.[p.id])
        );
      if (allReadyToVote) {
        startVotingPhase(io, room);
      }
    } else if (room.status === "voting") {
      delete room.gameData.votes[playerId];
      const aliveConnected = room.players.filter(
        (p) => p.isAlive && p.connected
      );
      const allVoted =
        aliveConnected.length > 0 &&
        aliveConnected.every((p) => room.gameData.votes[p.id] !== undefined);
      if (allVoted) {
        finishVotingPhase(io, room);
      }
    }
  }

  io.to(roomCode).emit("player_left", {
    playerId,
    nickname: removedPlayer.nickname,
    newHostId,
    room: serializeRoom(room),
  });
}

function emitFullReconnectState(socket, room, player) {
  socket.emit("room_joined", {
    room: serializeRoom(room),
    myPlayerId: player.id,
    reconnected: true,
  });

  if (room.status === "lobby") return;

  socket.emit("game_started", {
    role: player.isImpostor ? "impostor" : "crew",
    ...(player.isImpostor ? {} : { word: room.gameData.secretWord }),
    category: room.gameData.resolvedCategory,
    room: serializeRoom(room),
    reconnected: true,
  });

  const remainingSeconds = room.gameData.phaseEndsAt
    ? Math.max(1, Math.ceil((room.gameData.phaseEndsAt - Date.now()) / 1000))
    : 15;

  if (room.status === "playing") {
    socket.emit("turn_started", {
      currentTurnPlayerId:
        room.gameData.turnOrder[room.gameData.currentTurnIndex] || null,
      currentTurnIndex: room.gameData.currentTurnIndex,
      round: room.gameData.round,
      endsAt: room.gameData.phaseEndsAt || Date.now() + 15000,
      durationSeconds: room.settings.hintTime,
      remainingSeconds,
      room: serializeRoom(room),
    });
  } else if (room.status === "debate") {
    socket.emit("debate_started", {
      endsAt: room.gameData.phaseEndsAt || Date.now() + 15000,
      durationSeconds: room.settings.debateTime || 45,
      round: room.gameData.round,
      hints: room.gameData.hints,
      chatMessages: room.gameData.chatMessages,
      room: serializeRoom(room),
    });
  } else if (room.status === "voting") {
    if (room.gameData.lastVoteResult) {
      socket.emit("vote_result", {
        ...room.gameData.lastVoteResult,
        room: serializeRoom(room),
      });
    } else {
      socket.emit("voting_started", {
        endsAt: room.gameData.phaseEndsAt || Date.now() + 15000,
        durationSeconds: room.settings.voteTime,
        round: room.gameData.round,
        hints: room.gameData.hints,
        room: serializeRoom(room),
      });
    }
  } else if (room.status === "guess") {
    const impostor = room.players.find(
      (p) => p.id === room.gameData.guessingImpostorId
    );
    socket.emit("guess_phase", {
      impostorId: room.gameData.guessingImpostorId,
      impostorNickname: impostor?.nickname || "Impostor",
      impostorAvatar: impostor?.avatar || player.avatar,
      endsAt: room.gameData.phaseEndsAt || Date.now() + 10000,
      durationSeconds: GUESS_PHASE_SECONDS,
      room: serializeRoom(room),
    });
  } else if (room.status === "ended" && room.gameData.resultSummary) {
    socket.emit("game_over", {
      ...room.gameData.resultSummary,
      room: serializeRoom(room),
    });
  }
}

export function attachGameSocketServer(io) {
  const store = getGlobalStore();
  if (store.attachedServers.has(io)) {
    return io;
  }
  store.attachedServers.add(io);

  const { rooms, socketToSession, disconnectTimers } = store;

  io.on("connection", (socket) => {
    const resolveAuthPlayerId = (payload) => {
      return sanitizePlayerId(
        payload?.playerId || socket.handshake?.auth?.playerId || ""
      );
    };

    const detachCurrentRoomIfAny = () => {
      const prev = socketToSession.get(socket.id);
      if (!prev) return;
      socket.leave(prev.roomCode);
      socketToSession.delete(socket.id);
      removePlayerPermanently(io, prev.roomCode, prev.playerId);
    };

    socket.on("create_room", (payload = {}) => {
      const playerId = resolveAuthPlayerId(payload);
      const nickname = sanitizeNickname(payload.nickname);
      const avatar = payload.avatar;

      if (!playerId) {
        socket.emit("error", { message: "Identidade de jogador inválida." });
        return;
      }
      if (!nickname) {
        socket.emit("error", {
          message: "Digite um nickname válido (até 15 caracteres)!",
        });
        return;
      }
      if (!isValidAvatar(avatar)) {
        socket.emit("error", {
          message: "Peça de avatar inválida! Use o seletor oficial do caso.",
        });
        return;
      }

      detachCurrentRoomIfAny();

      const roomCode = generateRoomCode(rooms);
      const hostPlayer = {
        id: playerId,
        nickname,
        avatar,
        isReady: true,
        isImpostor: false,
        isAlive: true,
        socketId: socket.id,
        connected: true,
      };

      const initialImpostors = [1, 2, 3].includes(Number(payload.impostors))
        ? Number(payload.impostors)
        : 1;

      const room = {
        roomCode,
        hostId: playerId,
        status: "lobby",
        players: [hostPlayer],
        settings: {
          impostors: initialImpostors,
          hintTime: 45,
          debateEnabled: true,
          debateTime: 45,
          voteTime: 45,
          category: "Aleatório",
        },
        gameData: {
          secretWord: "",
          resolvedCategory: "",
          totalImpostors: initialImpostors,
          initialCrewCount: 0,
          currentTurnIndex: 0,
          turnOrder: [],
          hints: [],
          chatMessages: [],
          skipDebateVotes: {},
          votes: {},
          round: 1,
          phaseEndsAt: null,
          guessingImpostorId: null,
          lastVoteResult: null,
          resultSummary: null,
        },
      };

      rooms.set(roomCode, room);
      socketToSession.set(socket.id, { playerId, roomCode });
      socket.join(roomCode);

      socket.emit("room_created", {
        room: serializeRoom(room),
        myPlayerId: playerId,
      });
    });

    socket.on("join_room", (payload = {}) => {
      const playerId = resolveAuthPlayerId(payload);
      const nickname = sanitizeNickname(payload.nickname);
      const avatar = payload.avatar;
      const roomCode =
        typeof payload.roomCode === "string"
          ? payload.roomCode.trim().toUpperCase()
          : "";

      if (!playerId) {
        socket.emit("error", { message: "Identidade de jogador inválida." });
        return;
      }
      if (roomCode.length !== 6) {
        socket.emit("error", {
          message: "O código da sala deve ter 6 caracteres!",
        });
        return;
      }

      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit("error", {
          message: "Sala não encontrada! Confira o código do convite.",
        });
        return;
      }

      // Verifica se este playerId já está na sala (ex: reconectando pelo código)
      const existingPlayer = room.players.find((p) => p.id === playerId);
      if (existingPlayer) {
        if (nickname) existingPlayer.nickname = nickname;
        if (avatar && isValidAvatar(avatar)) existingPlayer.avatar = avatar;
        clearDisconnectTimer(roomCode, playerId);
        existingPlayer.socketId = socket.id;
        existingPlayer.connected = true;
        socketToSession.set(socket.id, { playerId, roomCode });
        socket.join(roomCode);

        emitFullReconnectState(socket, room, existingPlayer);
        socket.to(roomCode).emit("player_updated", {
          player: serializePlayer(existingPlayer, room.status === "ended"),
          room: serializeRoom(room),
        });
        return;
      }

      if (!nickname) {
        socket.emit("error", {
          message: "Digite um nickname válido (até 15 caracteres)!",
        });
        return;
      }
      if (!isValidAvatar(avatar)) {
        socket.emit("error", {
          message: "Peça de avatar inválida! Escolha opções válidas.",
        });
        return;
      }

      if (room.status !== "lobby") {
        socket.emit("error", {
          message: "A partida já começou! Aguarde a próxima rodada para entrar.",
        });
        return;
      }

      if (room.players.length >= MAX_PLAYERS) {
        socket.emit("error", {
          message: "O caso lotou! Esta sala já está com 8 jogadores.",
        });
        return;
      }

      const prev = socketToSession.get(socket.id);
      if (prev && prev.roomCode !== roomCode) {
        detachCurrentRoomIfAny();
      }

      const warning = findDuplicateAvatarWarning(room, playerId, avatar);

      const newPlayer = {
        id: playerId,
        nickname,
        avatar,
        isReady: true,
        isImpostor: false,
        isAlive: true,
        socketId: socket.id,
        connected: true,
      };

      room.players.push(newPlayer);
      socketToSession.set(socket.id, { playerId, roomCode });
      socket.join(roomCode);

      socket.emit("room_joined", {
        room: serializeRoom(room),
        myPlayerId: playerId,
        ...(warning ? { warning } : {}),
      });

      socket.to(roomCode).emit("player_joined", {
        player: serializePlayer(newPlayer),
        room: serializeRoom(room),
        ...(warning ? { warning } : {}),
      });
    });

    socket.on("reconnect", (payload = {}) => {
      const playerId = sanitizePlayerId(
        payload.playerId || socket.handshake?.auth?.playerId || ""
      );
      const roomCode =
        typeof payload.roomCode === "string"
          ? payload.roomCode.trim().toUpperCase()
          : "";

      if (!playerId || !roomCode) return;

      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit("error", {
          message: "A sala anterior já foi encerrada.",
        });
        return;
      }

      const player = room.players.find((p) => p.id === playerId);
      if (!player) {
        socket.emit("error", {
          message: "Sessão expirada nesta sala.",
        });
        return;
      }

      clearDisconnectTimer(roomCode, playerId);
      player.socketId = socket.id;
      player.connected = true;
      socketToSession.set(socket.id, { playerId, roomCode });
      socket.join(roomCode);

      emitFullReconnectState(socket, room, player);

      socket.to(roomCode).emit("player_updated", {
        player: serializePlayer(player, room.status === "ended"),
        room: serializeRoom(room),
      });
    });

    socket.on("update_profile", (payload = {}) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;

      const room = rooms.get(session.roomCode);
      if (!room) return;

      if (room.status !== "lobby") {
        socket.emit("error", {
          message: "Só é possível trocar o visual no lobby antes da partida!",
        });
        return;
      }

      const player = room.players.find((p) => p.id === session.playerId);
      if (!player) return;

      if (payload.avatar !== undefined) {
        if (!isValidAvatar(payload.avatar)) {
          socket.emit("error", {
            message: "Avatar rejeitado! Uma ou mais peças não são válidas.",
          });
          return;
        }
        player.avatar = payload.avatar;
      }

      if (payload.nickname !== undefined) {
        const cleanNick = sanitizeNickname(payload.nickname);
        if (!cleanNick) {
          socket.emit("error", {
            message: "O nickname precisa ter entre 1 e 15 caracteres!",
          });
          return;
        }
        player.nickname = cleanNick;
      }

      const warning = findDuplicateAvatarWarning(
        room,
        player.id,
        player.avatar
      );

      io.to(room.roomCode).emit("player_updated", {
        player: serializePlayer(player),
        room: serializeRoom(room),
        ...(warning ? { warning } : {}),
      });
    });

    socket.on("update_settings", (payload = {}) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;

      const room = rooms.get(session.roomCode);
      if (!room) return;

      if (room.hostId !== session.playerId) {
        socket.emit("error", {
          message: "Apenas o anfitrião do caso pode mudar as regras!",
        });
        return;
      }

      if (room.status !== "lobby") {
        socket.emit("error", {
          message: "Não é possível alterar regras com o jogo em andamento.",
        });
        return;
      }

      if (payload.impostors !== undefined) {
        const imp = Number(payload.impostors);
        if (imp === 1 || imp === 2 || imp === 3) {
          room.settings.impostors = imp;
        }
      }

      if (payload.hintTime !== undefined) {
        const ht = Number(payload.hintTime);
        if (ALLOWED_TIMES.includes(ht)) {
          room.settings.hintTime = ht;
        }
      }

      if (payload.debateEnabled !== undefined) {
        room.settings.debateEnabled = Boolean(payload.debateEnabled);
      }

      if (payload.debateTime !== undefined) {
        const dt = Number(payload.debateTime);
        if (ALLOWED_DEBATE_TIMES.includes(dt)) {
          room.settings.debateTime = dt;
        }
      }

      if (payload.voteTime !== undefined) {
        const vt = Number(payload.voteTime);
        if (ALLOWED_TIMES.includes(vt)) {
          room.settings.voteTime = vt;
        }
      }

      if (
        typeof payload.category === "string" &&
        ALLOWED_CATEGORIES.includes(payload.category)
      ) {
        room.settings.category = payload.category;
      }

      io.to(room.roomCode).emit("settings_updated", {
        settings: { ...room.settings },
        room: serializeRoom(room),
      });
    });

    socket.on("start_game", () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;

      const room = rooms.get(session.roomCode);
      if (!room) return;

      if (room.hostId !== session.playerId) {
        socket.emit("error", {
          message: "Só o anfitrião pode começar o caso!",
        });
        return;
      }

      if (room.status !== "lobby") return;

      const connectedPlayers = room.players.filter((p) => p.connected);
      const minRequiredForImpostors = Math.max(
        MIN_PLAYERS,
        (room.settings.impostors || 1) + 1
      );
      if (connectedPlayers.length < minRequiredForImpostors) {
        socket.emit("error", {
          message:
            (room.settings.impostors || 1) >= MIN_PLAYERS
              ? `Para jogar com ${room.settings.impostors} impostores, são necessários pelo menos ${minRequiredForImpostors} jogadores conectados!`
              : `Precisamos de pelo menos ${MIN_PLAYERS} jogadores conectados para começar!`,
        });
        return;
      }

      const actualImpostorCount = Math.min(
        Math.max(1, room.settings.impostors || 1),
        room.players.length - 1
      );

      const { word, resolvedCategory } = pickSecretWord(
        room.settings.category,
        room.gameData.secretWord
      );

      const shuffledIds = shuffleArray(room.players.map((p) => p.id));
      const impostorIdSet = new Set(shuffledIds.slice(0, actualImpostorCount));
      const turnOrder = shuffleArray(room.players.map((p) => p.id));

      for (const player of room.players) {
        player.isImpostor = impostorIdSet.has(player.id);
        player.isAlive = true;
      }

      room.status = "playing";
      room.gameData = {
        secretWord: word,
        resolvedCategory,
        totalImpostors: actualImpostorCount,
        initialCrewCount: room.players.length - actualImpostorCount,
        currentTurnIndex: 0,
        turnOrder,
        hints: [],
        chatMessages: [],
        skipDebateVotes: {},
        votes: {},
        round: 1,
        phaseEndsAt: null,
        guessingImpostorId: null,
        lastVoteResult: null,
        resultSummary: null,
      };

      const publicRoom = serializeRoom(room);

      // Envio ESTRITAMENTE INDIVIDUAL por socket (impostor NUNCA recebe secretWord!)
      for (const player of room.players) {
        if (!player.socketId) continue;
        const targetSocket = io.sockets.sockets.get(player.socketId);
        if (!targetSocket) continue;

        if (player.isImpostor) {
          targetSocket.emit("game_started", {
            role: "impostor",
            category: resolvedCategory,
            room: publicRoom,
          });
        } else {
          targetSocket.emit("game_started", {
            role: "crew",
            word,
            category: resolvedCategory,
            room: publicRoom,
          });
        }
      }

      startTurn(io, room, 0);
    });

    socket.on("send_hint", (payload = {}) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;

      const room = rooms.get(session.roomCode);
      if (!room || room.status !== "playing") return;

      const expectedPlayerId =
        room.gameData.turnOrder[room.gameData.currentTurnIndex];
      if (expectedPlayerId !== session.playerId) {
        socket.emit("error", {
          message: "Calma aí! Ainda não é a sua vez de dar dica.",
        });
        return;
      }

      const player = room.players.find((p) => p.id === session.playerId);
      if (!player || !player.isAlive) return;

      const cleanedText =
        typeof payload.text === "string"
          ? payload.text.replace(/\s+/g, " ").trim().slice(0, 45)
          : "";

      if (!cleanedText) {
        socket.emit("error", {
          message: "Digite uma palavra ou dica curta antes de enviar!",
        });
        return;
      }

      // Evita que inocente entregue a palavra exata sem querer
      const normHint = normalizeWord(cleanedText);
      const normSecret = normalizeWord(room.gameData.secretWord);
      if (!player.isImpostor && normSecret && normHint.includes(normSecret)) {
        socket.emit("error", {
          message:
            "Psiu! Você não pode escrever a própria palavra secreta na dica! 🤫",
        });
        return;
      }

      handleHintSubmission(io, room, player.id, cleanedText, false);
    });

    socket.on("send_chat", (payload = {}) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;

      const room = rooms.get(session.roomCode);
      if (!room) return;

      if (!room.settings.debateEnabled) {
        socket.emit("error", {
          message: "O debate por chat está desativado nas regras desta sala.",
        });
        return;
      }

      if (
        room.status !== "debate" &&
        room.status !== "voting" &&
        room.status !== "ended"
      ) {
        socket.emit("error", {
          message: "O chat abre durante a fase de debate e votação!",
        });
        return;
      }

      const sender = room.players.find((p) => p.id === session.playerId);
      if (!sender) return;

      if (room.status !== "ended" && !sender.isAlive) {
        socket.emit("error", {
          message:
            "Jogadores eliminados não podem enviar mensagens até o fim da partida! 👻",
        });
        return;
      }

      const cleanedText =
        typeof payload.text === "string"
          ? payload.text
              .replace(/[\u0000-\u001F\u007F]/g, "")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 180)
          : "";

      if (!cleanedText) return;

      // Impede que inocentes revelem a palavra secreta durante o debate/votação
      if (room.status !== "ended" && !sender.isImpostor) {
        const normMsg = normalizeWord(cleanedText);
        const normSecret = normalizeWord(room.gameData.secretWord);
        if (normSecret && normMsg.includes(normSecret)) {
          socket.emit("error", {
            message:
              "Psiu! Você não pode escrever a palavra secreta no chat do debate! 🤫",
          });
          return;
        }
      }

      const chatEntry = {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        playerId: sender.id,
        nickname: sender.nickname,
        avatar: sender.avatar,
        text: cleanedText,
        round: room.gameData.round,
        createdAt: Date.now(),
      };

      if (!Array.isArray(room.gameData.chatMessages)) {
        room.gameData.chatMessages = [];
      }
      room.gameData.chatMessages.push(chatEntry);
      if (room.gameData.chatMessages.length > MAX_CHAT_MESSAGES) {
        room.gameData.chatMessages =
          room.gameData.chatMessages.slice(-MAX_CHAT_MESSAGES);
      }

      io.to(room.roomCode).emit("chat_message", {
        message: chatEntry,
        chatMessages: room.gameData.chatMessages,
        room: serializeRoom(room),
      });
    });

    socket.on("skip_debate", (payload = {}) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;

      const room = rooms.get(session.roomCode);
      if (!room || room.status !== "debate") return;

      // Anfitrião pode opcionalmente avançar direto para a votação se todos já conversaram
      if (payload.forceEnd && room.hostId === session.playerId) {
        startVotingPhase(io, room);
        return;
      }

      const player = room.players.find((p) => p.id === session.playerId);
      if (!player || !player.isAlive) {
        socket.emit("error", {
          message: "Apenas jogadores vivos podem sinalizar pronto para votar!",
        });
        return;
      }

      if (!room.gameData.skipDebateVotes) {
        room.gameData.skipDebateVotes = {};
      }

      if (room.gameData.skipDebateVotes[player.id]) {
        delete room.gameData.skipDebateVotes[player.id];
      } else {
        room.gameData.skipDebateVotes[player.id] = true;
      }

      io.to(room.roomCode).emit("debate_updated", {
        skipDebatePlayerIds: Object.keys(room.gameData.skipDebateVotes),
        room: serializeRoom(room),
      });

      const aliveConnected = room.players.filter(
        (p) => p.isAlive && p.connected
      );
      const everyoneReady =
        aliveConnected.length > 0 &&
        aliveConnected.every(
          (p) => Boolean(room.gameData.skipDebateVotes[p.id])
        );

      if (everyoneReady) {
        startVotingPhase(io, room);
      }
    });

    socket.on("vote", (payload = {}) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;

      const room = rooms.get(session.roomCode);
      if (!room || room.status !== "voting" || room.gameData.lastVoteResult) {
        return;
      }

      const voter = room.players.find((p) => p.id === session.playerId);
      if (!voter || !voter.isAlive) {
        socket.emit("error", {
          message: "Apenas jogadores vivos podem votar nesta rodada!",
        });
        return;
      }

      const rawTarget = payload.targetPlayerId;
      let normalizedTarget = "skip";

      if (rawTarget && rawTarget !== "skip") {
        const targetPlayer = room.players.find(
          (p) => p.id === rawTarget && p.isAlive
        );
        if (!targetPlayer) {
          socket.emit("error", { message: "Alvo de voto inválido!" });
          return;
        }
        normalizedTarget = targetPlayer.id;
      }

      room.gameData.votes[voter.id] = normalizedTarget;

      // Atualiza estado público para mostrar quem já votou (sem revelar o alvo)
      io.to(room.roomCode).emit("player_updated", {
        player: serializePlayer(voter),
        room: serializeRoom(room),
      });

      const aliveConnected = room.players.filter(
        (p) => p.isAlive && p.connected
      );
      const everyoneVoted =
        aliveConnected.length > 0 &&
        aliveConnected.every((p) => room.gameData.votes[p.id] !== undefined);

      if (everyoneVoted) {
        finishVotingPhase(io, room);
      }
    });

    socket.on("impostor_guess", (payload = {}) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;

      const room = rooms.get(session.roomCode);
      if (!room || room.status !== "guess") return;

      if (room.gameData.guessingImpostorId !== session.playerId) {
        socket.emit("error", {
          message: "Apenas o impostor eliminado pode tentar adivinhar a palavra!",
        });
        return;
      }

      const guessWord =
        typeof payload.word === "string" ? payload.word.trim() : "";
      if (!guessWord) {
        socket.emit("error", {
          message: "Digite seu palpite para a palavra secreta!",
        });
        return;
      }

      resolveImpostorGuess(io, room, guessWord, false);
    });

    socket.on("play_again", () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;

      const room = rooms.get(session.roomCode);
      if (!room || room.status !== "ended") return;

      // Host reinicia a sala para o lobby (ou qualquer jogador caso o host esteja desconectado)
      const hostPlayer = room.players.find((p) => p.id === room.hostId);
      if (room.hostId !== session.playerId && hostPlayer?.connected) {
        socket.emit("error", {
          message: "Aguarde o anfitrião puxar a próxima rodada!",
        });
        return;
      }

      clearPhaseTimer(room.roomCode);
      room.status = "lobby";

      for (const player of room.players) {
        player.isImpostor = false;
        player.isAlive = true;
        player.isReady = true;
      }

      room.gameData = {
        secretWord: room.gameData.secretWord, // guardado apenas para não repetir em seguida
        resolvedCategory: "",
        totalImpostors: room.settings.impostors || 1,
        initialCrewCount: 0,
        currentTurnIndex: 0,
        turnOrder: [],
        hints: [],
        chatMessages: [],
        skipDebateVotes: {},
        votes: {},
        round: 1,
        phaseEndsAt: null,
        guessingImpostorId: null,
        lastVoteResult: null,
        resultSummary: null,
      };

      const serialized = serializeRoom(room);
      io.to(room.roomCode).emit("settings_updated", {
        settings: { ...room.settings },
        room: serialized,
        returnedToLobby: true,
      });
    });

    socket.on("leave_room", () => {
      detachCurrentRoomIfAny();
    });

    socket.on("disconnect", () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      socketToSession.delete(socket.id);

      const { roomCode, playerId } = session;
      const room = rooms.get(roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;

      // Se o jogador já reconectou em outro socket antes deste fechar, ignora
      if (player.socketId !== socket.id) return;

      player.connected = false;

      io.to(roomCode).emit("player_updated", {
        player: serializePlayer(player, room.status === "ended"),
        room: serializeRoom(room),
      });

      clearDisconnectTimer(roomCode, playerId);
      const timerKey = `${roomCode}:${playerId}`;
      const handle = setTimeout(() => {
        disconnectTimers.delete(timerKey);
        const currentRoom = rooms.get(roomCode);
        if (!currentRoom) return;
        const target = currentRoom.players.find((p) => p.id === playerId);
        if (target && !target.connected) {
          removePlayerPermanently(io, roomCode, playerId);
        }
      }, RECONNECT_WINDOW_MS);

      disconnectTimers.set(timerKey, handle);
    });
  });

  return io;
}
