"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { AlertTriangle, Info, Volume2, VolumeX, X } from "lucide-react";
import type {
  AvatarConfig,
  GameOverPayload,
  ImpostorCount,
  PlayerIdentity,
  RoomSettings,
  RoomState,
  VoteResultPayload,
} from "./types/game";
import {
  getSavedRoomCode,
  loadOrCreateIdentity,
  saveIdentity,
  setSavedRoomCode,
  switchToIsolatedTabIdentity,
} from "./lib/identity";
import { GameAudio, type SoundCue } from "./lib/gameAudio";
import { PartyBackground, ConfettiBurst } from "./components/PartyDecorations";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Lobby } from "./components/Lobby";
import { GameScreen } from "./components/GameScreen";
import { AvatarPicker } from "./components/AvatarPicker";

interface ToastMessage {
  id: number;
  type: "error" | "info";
  text: string;
}

export interface ImpostorPartyAppProps {
  socketMode?: "integrated" | "standalone";
  standaloneUrl?: string;
}

function getButtonSoundCue(button: HTMLButtonElement): SoundCue {
  const label = [
    button.getAttribute("aria-label"),
    button.title,
    button.textContent,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR");

  if (button.getAttribute("role") === "tab") return "ui-tab";
  if (/copiar|copiado/.test(label)) return "ui-copy";
  if (/sortear|aleat[oó]rio|gerar outro/.test(label)) return "ui-randomize";
  if (/votar|voto|vota[cç][aã]o/.test(label)) return "ui-vote";
  if (/enviar|mensagem|dica/.test(label)) return "ui-send";
  if (/ocultar|mostrar|espiar|papel secreto/.test(label)) return "ui-reveal";
  if (/configura[cç][oõ]es|regras/.test(label)) return "ui-settings";
  if (/sair|abandonar|fechar|voltar/.test(label)) return "ui-close";
  if (/ativar|desativar|recolher|expandir|\bon\b|\boff\b/.test(label)) {
    return "ui-toggle";
  }
  if (button.closest('[aria-label="Chat de debate da rodada"]')) {
    return "ui-chat";
  }
  if (/chat|debate/.test(label)) return "ui-chat";
  if (/abrir|entrar|iniciar|pronto|confirmar|salvar|selar|jogar novamente|conectar/.test(label)) {
    return "ui-confirm";
  }
  if (button.hasAttribute("aria-pressed")) return "ui-select";
  return "ui-click";
}

export function ImpostorPartyApp({
  socketMode = "integrated",
  standaloneUrl = "http://localhost:3001",
}: ImpostorPartyAppProps) {
  // Identidade anônima resolvida de imediato no cliente (sem tela de carregamento).
  const [initialBoot] = useState(() => loadOrCreateIdentity());
  const [identity, setIdentity] = useState<PlayerIdentity>(initialBoot.identity);
  const [isIsolatedTab, setIsIsolatedTab] = useState(initialBoot.isIsolatedTab);

  const [activeServerUrl, setActiveServerUrl] = useState(standaloneUrl);
  const [connected, setConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [myRole, setMyRole] = useState<"crew" | "impostor">("crew");
  const [secretWord, setSecretWord] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("Aleatório");
  const [voteResult, setVoteResult] = useState<VoteResultPayload | null>(null);
  const [gameOverResult, setGameOverResult] =
    useState<GameOverPayload | null>(null);

  const [burstCounter, setBurstCounter] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<GameAudio | null>(null);
  const roomRef = useRef<RoomState | null>(null);
  const identityRef = useRef<PlayerIdentity | null>(null);
  const isIsolatedTabRef = useRef<boolean>(false);
  const myRoleRef = useRef(myRole);

  if (!audioRef.current) audioRef.current = new GameAudio();
  roomRef.current = room;
  identityRef.current = identity;
  isIsolatedTabRef.current = isIsolatedTab;
  myRoleRef.current = myRole;

  const pushToast = useCallback((type: "error" | "info", text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-2), { id, type, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const playSound = useCallback((cue: SoundCue) => {
    audioRef.current?.play(cue);
  }, []);

  const handleButtonClickCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest("button");
      if (
        !(button instanceof HTMLButtonElement) ||
        button.disabled ||
        button.hasAttribute("data-sound-ignore")
      ) {
        return;
      }
      playSound(getButtonSoundCue(button));
    },
    [playSound]
  );

  const handleToggleSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (soundEnabled) {
      playSound("toggle-off");
      audio.disable();
      setSoundEnabled(false);
      return;
    }

    void audio
      .enable()
      .then(() => {
        setSoundEnabled(true);
        audio.play("toggle");
      })
      .catch((error: unknown) => {
        console.error("Não foi possível ativar o áudio do jogo.", error);
        pushToast("info", "Não foi possível ativar o som neste navegador.");
      });
  }, [playSound, pushToast, soundEnabled]);

  const triggerConfetti = useCallback(() => {
    setBurstCounter((c) => c + 1);
  }, []);

  // 1. Sincroniza identidade entre abas (multi-jogador no mesmo navegador)
  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }

    const tabToken = `${Date.now()}-${Math.random()}`;
    let channel: BroadcastChannel;
    try {
      channel = new BroadcastChannel("impostor_party_tabs");
    } catch {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || msg.tabToken === tabToken) return;

      // Se esta aba é a dona ativa da identidade principal, avisa abas recém-abertas
      if (
        msg.type === "CHECK_PRIMARY" &&
        !isIsolatedTabRef.current &&
        identityRef.current?.playerId === msg.playerId
      ) {
        channel.postMessage({
          type: "PRIMARY_IN_USE",
          playerId: msg.playerId,
          tabToken,
        });
      }

      // Se acabamos de abrir uma 2ª/3ª aba e outra aba já está usando o playerId do localStorage
      if (
        msg.type === "PRIMARY_IN_USE" &&
        !isIsolatedTabRef.current &&
        !roomRef.current &&
        identityRef.current?.playerId === msg.playerId
      ) {
        const isolated = switchToIsolatedTabIdentity();
        setIdentity(isolated);
        setIsIsolatedTab(true);
      }
    };

    channel.addEventListener("message", onMessage);

    if (!isIsolatedTabRef.current && identityRef.current) {
      channel.postMessage({
        type: "CHECK_PRIMARY",
        playerId: identityRef.current.playerId,
        tabToken,
      });
    }

    return () => {
      channel.removeEventListener("message", onMessage);
      channel.close();
    };
  }, []);

  // 2. Inicializa e gerencia Socket.IO quando a identidade está pronta
  useEffect(() => {
    if (!identity.playerId) return;

    let cancelled = false;
    let activeSocket: Socket | null = null;

    async function connectSocket(currentPlayerId: string) {
      try {
        if (socketMode === "integrated") {
          await fetch("/api/socket-init", { cache: "no-store" });
        }
      } catch {
        // Continua tentativa de conexão
      }

      if (cancelled) return;

      const socket =
        socketMode === "integrated"
          ? io({
              path: "/api/socketio",
              addTrailingSlash: false,
              transports: ["polling", "websocket"],
              auth: { playerId: currentPlayerId },
            })
          : io(activeServerUrl, {
              transports: ["polling", "websocket"],
              auth: { playerId: currentPlayerId },
            });

      activeSocket = socket;
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        const savedCode = getSavedRoomCode(isIsolatedTabRef.current);
        if (savedCode) {
          socket.emit("reconnect", {
            playerId: currentPlayerId,
            roomCode: savedCode,
          });
        }
      });

      socket.on("disconnect", () => {
        setConnected(false);
      });

      socket.on("room_created", (payload: { room: RoomState }) => {
        setRoom(payload.room);
        setSavedRoomCode(payload.room.roomCode, isIsolatedTabRef.current);
        triggerConfetti();
        playSound("case-open");
      });

      socket.on(
        "room_joined",
        (payload: {
          room: RoomState;
          warning?: string;
          reconnected?: boolean;
        }) => {
          setRoom(payload.room);
          setSavedRoomCode(payload.room.roomCode, isIsolatedTabRef.current);
          playSound(payload.reconnected ? "reconnect" : "case-open");
          if (payload.warning) {
            pushToast("info", payload.warning);
          } else if (payload.reconnected) {
            pushToast("info", "Reconectado ao caso com sucesso! 🔎");
          }
        }
      );

      socket.on(
        "player_joined",
        (payload: { room: RoomState; warning?: string }) => {
          setRoom(payload.room);
          triggerConfetti();
          playSound("player-arrives");
          if (payload.warning) {
            pushToast("info", payload.warning);
          }
        }
      );

      socket.on(
        "player_left",
        (payload: { nickname: string; room: RoomState }) => {
          setRoom(payload.room);
          playSound("player-leaves");
          pushToast("info", `${payload.nickname} saiu do caso.`);
        }
      );

      socket.on(
        "player_updated",
        (payload: { room: RoomState; warning?: string }) => {
          setRoom(payload.room);
          if (payload.warning) {
            pushToast("info", payload.warning);
          }
        }
      );

      socket.on(
        "settings_updated",
        (payload: { room: RoomState; returnedToLobby?: boolean }) => {
          setRoom(payload.room);
          if (payload.returnedToLobby) {
            setVoteResult(null);
            setGameOverResult(null);
            setSecretWord(null);
          }
        }
      );

      socket.on(
        "game_started",
        (payload: {
          role: "crew" | "impostor";
          word?: string;
          category: string;
          room: RoomState;
        }) => {
          setMyRole(payload.role);
          setSecretWord(payload.word ?? null);
          setCategory(payload.category || payload.room.gameData.category);
          setVoteResult(null);
          setGameOverResult(null);
          setRoom(payload.room);
          playSound("investigation-start");
        }
      );

      socket.on("turn_started", (payload: { room: RoomState }) => {
        setVoteResult(null);
        setRoom(payload.room);
      });

      socket.on("hint_received", (payload: { room: RoomState }) => {
        setRoom(payload.room);
        playSound("clue");
      });

      socket.on("debate_started", (payload: { room: RoomState }) => {
        setVoteResult(null);
        setRoom(payload.room);
        playSound("debate");
      });

      socket.on("debate_updated", (payload: { room: RoomState }) => {
        setRoom(payload.room);
      });

      socket.on("chat_message", (payload: { room: RoomState }) => {
        setRoom(payload.room);
        const messages = payload.room.gameData.chatMessages;
        const latestMessage = messages[messages.length - 1];
        if (latestMessage && latestMessage.playerId !== currentPlayerId) {
          playSound("message");
        }
      });

      socket.on("voting_started", (payload: { room: RoomState }) => {
        setVoteResult(null);
        setRoom(payload.room);
        playSound("voting");
      });

      socket.on(
        "vote_result",
        (payload: VoteResultPayload & { room: RoomState }) => {
          setVoteResult(payload);
          setRoom(payload.room);
          playSound("vote-result");
        }
      );

      socket.on("guess_phase", (payload: { room: RoomState }) => {
        setVoteResult(null);
        setRoom(payload.room);
        playSound("guess");
      });

      socket.on(
        "game_over",
        (payload: GameOverPayload & { room: RoomState }) => {
          setVoteResult(null);
          setGameOverResult(payload);
          setRoom(payload.room);
          triggerConfetti();
          playSound(
            payload.winner === myRoleRef.current ? "victory" : "defeat"
          );
        }
      );

      socket.on("error", (payload: { message: string }) => {
        playSound("error");
        const msg = payload?.message || "Ocorreu um erro inesperado.";
        pushToast("error", msg);
        if (
          msg.includes("encerrada") ||
          msg.includes("expirada") ||
          msg.includes("não encontrada")
        ) {
          setSavedRoomCode(null, isIsolatedTabRef.current);
        }
      });
    }

    connectSocket(identity.playerId);

    return () => {
      cancelled = true;
      if (activeSocket) {
        activeSocket.disconnect();
      }
      socketRef.current = null;
    };
  }, [
    identity.playerId,
    socketMode,
    activeServerUrl,
    pushToast,
    triggerConfetti,
    playSound,
  ]);

  const handleChangeServerUrl = (newUrl: string) => {
    try {
      window.localStorage.setItem("impostor_socket_url", newUrl);
    } catch {
      /* armazenamento bloqueado — a URL vale só para esta sessão */
    }
    setConnected(false);
    setActiveServerUrl(newUrl);
    pushToast("info", `Conectando ao servidor ${newUrl}...`);
  };

  const handleNicknameChange = (newNick: string) => {
    if (!identity) return;
    const updated: PlayerIdentity = {
      ...identity,
      nickname: newNick.slice(0, 15),
    };
    setIdentity(updated);
    saveIdentity(updated, isIsolatedTab);
  };

  const handleAvatarSave = (newAvatar: AvatarConfig, maybeNick?: string) => {
    if (!identity) return;
    const updated: PlayerIdentity = {
      ...identity,
      nickname:
        maybeNick !== undefined
          ? maybeNick.trim().slice(0, 15) || identity.nickname
          : identity.nickname,
      avatar: newAvatar,
    };
    setIdentity(updated);
    saveIdentity(updated, isIsolatedTab);

    if (room && room.status === "lobby" && socketRef.current) {
      socketRef.current.emit("update_profile", {
        nickname: updated.nickname,
        avatar: updated.avatar,
      });
    }
  };

  const handleCreateTabIdentity = () => {
    const fresh = switchToIsolatedTabIdentity();
    setIdentity(fresh);
    setIsIsolatedTab(true);
    pushToast("info", `Nova identidade criada nesta aba: ${fresh.nickname}!`);
  };

  const handleCreateRoom = (impostors: ImpostorCount = 1) => {
    if (!identity || !socketRef.current) return;
    const cleanNick = identity.nickname.trim().slice(0, 15);
    if (!cleanNick) {
      pushToast("error", "Escolha um apelido antes de criar a sala!");
      return;
    }
    saveIdentity({ ...identity, nickname: cleanNick }, isIsolatedTab);
    socketRef.current.emit("create_room", {
      playerId: identity.playerId,
      nickname: cleanNick,
      avatar: identity.avatar,
      impostors,
    });
  };

  const handleJoinRoom = (roomCode: string) => {
    if (!identity || !socketRef.current) return;
    const cleanNick = identity.nickname.trim().slice(0, 15);
    if (!cleanNick) {
      pushToast("error", "Escolha um apelido antes de entrar na sala!");
      return;
    }
    saveIdentity({ ...identity, nickname: cleanNick }, isIsolatedTab);
    socketRef.current.emit("join_room", {
      roomCode,
      playerId: identity.playerId,
      nickname: cleanNick,
      avatar: identity.avatar,
    });
  };

  const handleLeaveRoom = () => {
    socketRef.current?.emit("leave_room");
    setSavedRoomCode(null, isIsolatedTab);
    setRoom(null);
    setVoteResult(null);
    setGameOverResult(null);
    setSecretWord(null);
  };

  const handleUpdateSettings = (partial: Partial<RoomSettings>) => {
    socketRef.current?.emit("update_settings", partial);
  };

  const handleStartGame = () => {
    socketRef.current?.emit("start_game");
  };

  const handleSendHint = (text: string) => {
    socketRef.current?.emit("send_hint", { text });
  };

  const handleSendChat = (text: string) => {
    socketRef.current?.emit("send_chat", { text });
  };

  const handleToggleSkipDebate = () => {
    socketRef.current?.emit("skip_debate", {});
  };

  const handleForceEndDebate = () => {
    socketRef.current?.emit("skip_debate", { forceEnd: true });
  };

  const handleVote = (targetPlayerId: string | "skip") => {
    socketRef.current?.emit("vote", { targetPlayerId });
  };

  const handleGuessWord = (word: string) => {
    socketRef.current?.emit("impostor_guess", { word });
  };

  const handlePlayAgain = () => {
    socketRef.current?.emit("play_again");
  };

  return (
    <div
      onClickCapture={handleButtonClickCapture}
      className="relative min-h-dvh bg-[#0E1230] text-white font-body overflow-x-hidden selection:bg-[#FFB020] selection:text-[#0B0E1F]"
    >
      <PartyBackground />
      <ConfettiBurst triggerKey={burstCounter} />

      <button
        type="button"
        data-sound-ignore
        onClick={handleToggleSound}
        aria-label={
          soundEnabled
            ? "Desativar trilha e efeitos sonoros"
            : "Ativar trilha e efeitos sonoros"
        }
        aria-pressed={soundEnabled}
        title={
          soundEnabled
            ? "Desativar trilha e efeitos sonoros"
            : "Ativar trilha e efeitos sonoros"
        }
        className={`fixed bottom-4 right-4 z-[60] flex min-h-12 items-center gap-2 rounded-full border-[3px] border-[#0B0E1F] px-3 text-[#0B0E1F] shadow-[0_4px_0_#05070F] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020] active:translate-y-1 active:shadow-none ${
          soundEnabled ? "bg-[#FFB020]" : "bg-[#F6EFE0]"
        }`}
      >
        {soundEnabled ? (
          <Volume2 className="h-5 w-5" aria-hidden="true" />
        ) : (
          <VolumeX className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="sr-only sm:not-sr-only text-[11px] font-black uppercase tracking-wider">
          Som {soundEnabled ? "ligado" : "desligado"}
        </span>
      </button>

      {/* Toasts Acessíveis */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-[20px] border-3 border-[#0B0E1F] shadow-[0_5px_0_#0B0E1F] font-bold text-sm animate-pop-in ${
              t.type === "error"
                ? "bg-[#E23B2E] text-white"
                : "bg-[#FFB020] text-[#0B0E1F]"
            }`}
          >
            {t.type === "error" ? (
              <AlertTriangle className="w-5 h-5 shrink-0 stroke-[2.8]" />
            ) : (
              <Info className="w-5 h-5 shrink-0 stroke-[2.8]" />
            )}
            <span className="flex-1">{t.text}</span>
            <button
              type="button"
              onClick={() =>
                setToasts((prev) => prev.filter((item) => item.id !== t.id))
              }
              aria-label="Fechar aviso"
              className="p-1 rounded-lg hover:bg-black/10"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        ))}
      </div>

      {/* Roteamento de telas */}
      {!room ? (
        <WelcomeScreen
          nickname={identity.nickname}
          avatar={identity.avatar}
          connected={connected}
          isIsolatedTab={isIsolatedTab}
          standaloneServerUrl={
            socketMode === "standalone" ? activeServerUrl : undefined
          }
          onChangeServerUrl={
            socketMode === "standalone" ? handleChangeServerUrl : undefined
          }
          onNicknameChange={handleNicknameChange}
          onOpenAvatarPicker={() => setPickerOpen(true)}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onCreateTabIdentity={handleCreateTabIdentity}
        />
      ) : room.status === "lobby" ? (
        <Lobby
          room={room}
          myPlayerId={identity.playerId}
          onOpenAvatarPicker={() => setPickerOpen(true)}
          onUpdateSettings={handleUpdateSettings}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
        />
      ) : (
        <GameScreen
          room={room}
          myPlayerId={identity.playerId}
          myRole={myRole}
          secretWord={secretWord}
          category={category}
          voteResult={voteResult}
          gameOverResult={gameOverResult}
          onSendHint={handleSendHint}
          onSendChat={handleSendChat}
          onToggleSkipDebate={handleToggleSkipDebate}
          onForceEndDebate={handleForceEndDebate}
          onVote={handleVote}
          onGuessWord={handleGuessWord}
          onPlayAgain={handlePlayAgain}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {/* Modal / Bottom Sheet do Editor de Avatar */}
      <AvatarPicker
        isOpen={pickerOpen}
        initialAvatar={identity.avatar}
        initialNickname={identity.nickname}
        allowNicknameEdit={Boolean(room)}
        onClose={() => setPickerOpen(false)}
        onSave={handleAvatarSave}
      />
    </div>
  );
}

export default ImpostorPartyApp;
