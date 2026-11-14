import React, { useState } from "react";
import { Clock, Eye, EyeOff, MessageCircle, Send } from "lucide-react";
import type { RoomState } from "../types/game";
import { useCountdown } from "../lib/useCountdown";
import { Avatar } from "./Avatar";

export interface HintPhaseProps {
  room: RoomState;
  myPlayerId: string;
  myRole: "crew" | "impostor";
  secretWord: string | null;
  category: string;
  onSendHint: (text: string) => void;
}

export function HintPhase({
  room,
  myPlayerId,
  myRole,
  secretWord,
  category,
  onSendHint,
}: HintPhaseProps) {
  const [hintInput, setHintInput] = useState("");
  const [hideSecret, setHideSecret] = useState(false);

  const secondsLeft = useCountdown(room.gameData.phaseEndsAt);
  const currentTurnPlayerId = room.gameData.currentTurnPlayerId;
  const activePlayer = room.players.find((p) => p.id === currentTurnPlayerId);
  const me = room.players.find((p) => p.id === myPlayerId);
  const isMyTurn = currentTurnPlayerId === myPlayerId && Boolean(me?.isAlive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = hintInput.trim();
    if (!trimmed || !isMyTurn) return;
    onSendHint(trimmed);
    setHintInput("");
  };

  return (
    <div className="space-y-5">
      {/* Cartão de Papel Secreto (com opção ocultar para jogar perto dos amigos) */}
      <section
        aria-label="Seu papel secreto na rodada"
        className={`rounded-[26px] border-4 border-[#0B0E1F] shadow-[0_7px_0_#0B0E1F] p-4 sm:p-5 transition-colors ${
          hideSecret
            ? "bg-[#1A2145] text-white"
            : myRole === "impostor"
              ? "bg-[#FF7A45] text-[#0B0E1F]"
              : "bg-[#63D2B0] text-[#0B0E1F]"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#0B0E1F] text-[#FFB020]">
              <span>Rodada {room.gameData.round}</span>
              <span>•</span>
              <span>Categoria: {category || room.gameData.category}</span>
              <span>•</span>
              <span>
                🕵️ {room.gameData.aliveImpostorsCount ?? room.settings.impostors}{" "}
                {(room.gameData.aliveImpostorsCount ??
                  room.settings.impostors) === 1
                  ? "Impostor"
                  : "Impostores"}
              </span>
            </div>

            {hideSecret ? (
              <p className="font-display text-xl sm:text-2xl font-bold text-[#FFB020] pt-1">
                🙈 Papel oculto (toque em Mostrar para espiar)
              </p>
            ) : myRole === "impostor" ? (
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  🕵️ VOCÊ É O IMPOSTOR!
                </h2>
                <p className="text-sm font-extrabold opacity-90">
                  Você NÃO sabe a palavra secreta! Observe as dicas e blefe para passar despercebido.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold">
                  ✨ Palavra Secreta:{" "}
                  <span className="inline-block px-3 py-0.5 rounded-xl bg-[#FFB020] border-2 border-[#0B0E1F] text-[#0B0E1F]">
                    {secretWord || "---"}
                  </span>
                </h2>
                <p className="text-sm font-extrabold opacity-90 mt-1">
                  Dê uma dica inteligente sem entregar a palavra para o Impostor!
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setHideSecret((v) => !v)}
            aria-label={
              hideSecret ? "Mostrar meu papel secreto" : "Ocultar meu papel secreto"
            }
            className="min-h-[48px] px-4 rounded-[18px] bg-[#F6EFE0] text-[#0B0E1F] font-display font-bold text-sm inline-flex items-center gap-2 border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
          >
            {hideSecret ? (
              <>
                <Eye className="w-4 h-4 stroke-[2.8]" />
                <span>Mostrar</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 stroke-[2.8]" />
                <span>Ocultar</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Fila de Turnos + Cronômetro */}
      <section className="bg-[#F6EFE0] text-[#0B0E1F] rounded-[26px] border-4 border-[#0B0E1F] shadow-[0_7px_0_#0B0E1F] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {activePlayer && (
              <Avatar
                avatar={activePlayer.avatar}
                size={56}
                label={`Avatar de ${activePlayer.nickname}`}
              />
            )}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#6A7794]">
                VEZ DE DAR DICA
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0B0E1F]">
                {isMyTurn
                  ? "🎤 É a SUA vez!"
                  : `${activePlayer?.nickname || "Jogador"} está pensando...`}
              </h3>
            </div>
          </div>

          {/* Cronômetro */}
          <div
            aria-live="polite"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-[20px] font-display font-bold text-xl border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] ${
              secondsLeft <= 10
                ? "bg-[#E23B2E] text-white animate-pulse"
                : "bg-[#FFB020] text-[#0B0E1F]"
            }`}
          >
            <Clock className="w-5 h-5 stroke-[2.8]" />
            <span>{secondsLeft}s</span>
          </div>
        </div>

        {/* Ordem dos jogadores vivos */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {room.gameData.turnOrder.map((pid, idx) => {
            const p = room.players.find((pl) => pl.id === pid);
            if (!p || !p.isAlive) return null;
            const isCurrent = pid === currentTurnPlayerId;
            const hasSpoken = idx < room.gameData.currentTurnIndex;

            return (
              <div
                key={pid}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 border-[#0B0E1F] shrink-0 text-xs font-extrabold ${
                  isCurrent
                    ? "bg-[#FFB020] text-[#0B0E1F] shadow-[0_3px_0_#0B0E1F]"
                    : hasSpoken
                      ? "bg-[#63D2B0]/60 text-[#0B0E1F]"
                      : "bg-[#ECE5D6] text-[#5A6785]"
                }`}
              >
                <Avatar avatar={p.avatar} size={28} label={p.nickname} />
                <span>{p.nickname}</span>
                {hasSpoken && <span aria-label="Já enviou dica">✓</span>}
              </div>
            );
          })}
        </div>

        {/* Campo de envio quando for a vez do jogador */}
        {isMyTurn ? (
          <form
            onSubmit={handleSubmit}
            className="pt-1 flex flex-col sm:flex-row gap-2.5"
          >
            <input
              type="text"
              maxLength={40}
              value={hintInput}
              onChange={(e) => setHintInput(e.target.value.slice(0, 40))}
              placeholder="Digite sua dica curta (ex: gelado, verão, redondo)..."
              aria-label="Digite sua dica para a rodada"
              autoFocus
              className="flex-1 min-h-[52px] px-4 rounded-[20px] bg-[#F2E8D2] text-[#0B0E1F] font-extrabold text-base sm:text-lg border-3 border-[#0B0E1F] focus:outline-none focus:ring-4 focus:ring-[#4C8DFF]"
            />
            <button
              type="submit"
              disabled={!hintInput.trim()}
              aria-label="Enviar dica"
              className="min-h-[52px] px-6 rounded-[20px] bg-[#4C8DFF] text-[#0B0E1F] font-display font-bold text-base sm:text-lg inline-flex items-center justify-center gap-2 border-3 border-[#0B0E1F] shadow-[0_5px_0_#0B0E1F] hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
            >
              <Send className="w-5 h-5 stroke-[2.8]" />
              <span>Enviar Dica</span>
            </button>
          </form>
        ) : !me?.isAlive ? (
          <div className="px-4 py-3 rounded-2xl bg-[#ECE5D6] border-2 border-[#0B0E1F] text-sm font-bold text-[#1A2145]">
            👻 Você foi eliminado em uma rodada anterior e está assistindo à dedução!
          </div>
        ) : null}
      </section>

      {/* Mural de Pistas Recebidas */}
      <section
        aria-label="Mural de dicas da partida"
        className="bg-[#1A2145] rounded-[26px] border-4 border-[#0B0E1F] shadow-[0_7px_0_#0B0E1F] p-4 sm:p-5"
      >
        <div className="flex items-center gap-2 mb-3 text-[#FFB020]">
          <MessageCircle className="w-5 h-5 stroke-[2.8]" />
          <h3 className="font-display font-bold text-lg">
            Mural de Pistas ({room.gameData.hints.length})
          </h3>
        </div>

        {room.gameData.hints.length === 0 ? (
          <p className="text-sm font-bold text-[#9FB0D0] py-4 text-center">
            A primeira dica do caso vai aparecer aqui em instantes...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {room.gameData.hints.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 bg-[#F6EFE0] text-[#0B0E1F] rounded-[20px] border-3 border-[#0B0E1F] p-3 shadow-[0_4px_0_#0B0E1F] animate-pop-in"
              >
                <Avatar
                  avatar={h.avatar}
                  size={46}
                  label={`Avatar de ${h.nickname}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold text-sm truncate">
                      {h.nickname}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#0E1230] text-[#FFB020]">
                      R{h.round}
                    </span>
                  </div>
                  <p
                    className={`text-base font-extrabold break-words mt-0.5 ${
                      h.timedOut ? "italic text-[#8C7AA8]" : "text-[#0B0E1F]"
                    }`}
                  >
                    “{h.text}”
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
