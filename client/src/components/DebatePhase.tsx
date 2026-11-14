import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FastForward,
  Vote,
} from "lucide-react";
import type { RoomState } from "../types/game";
import { useCountdown } from "../lib/useCountdown";
import { Avatar } from "./Avatar";
import { DebateChatPanel } from "./DebateChatPanel";

export interface DebatePhaseProps {
  room: RoomState;
  myPlayerId: string;
  myRole: "crew" | "impostor";
  secretWord: string | null;
  category: string;
  onSendChat: (text: string) => void;
  onToggleSkipDebate: () => void;
  onForceEndDebate: () => void;
}

export function DebatePhase({
  room,
  myPlayerId,
  myRole,
  secretWord,
  category,
  onSendChat,
  onToggleSkipDebate,
  onForceEndDebate,
}: DebatePhaseProps) {
  const [peekRole, setPeekRole] = useState(false);
  const secondsLeft = useCountdown(room.gameData.phaseEndsAt);

  const me = room.players.find((p) => p.id === myPlayerId);
  const amIAlive = Boolean(me?.isAlive);
  const isHost = room.hostId === myPlayerId;

  const aliveConnectedCount = room.players.filter(
    (p) => p.isAlive && p.connected
  ).length;
  const skipIds = room.gameData.skipDebatePlayerIds || [];
  const amIReadyToVote = skipIds.includes(myPlayerId);

  const currentRoundHints = room.gameData.hints.filter(
    (h) => h.round === room.gameData.round
  );
  const hintsToShow =
    currentRoundHints.length > 0 ? currentRoundHints : room.gameData.hints;

  return (
    <div className="space-y-5">
      {/* Cabeçalho da Roda de Debate */}
      <section className="bg-[#4C8DFF] text-[#0B0E1F] rounded-[26px] border-4 border-[#0B0E1F] shadow-[0_7px_0_#0B0E1F] p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex flex-wrap items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#0B0E1F] text-[#FFB020]">
              <span>RODADA {room.gameData.round}</span>
              <span>•</span>
              <span>CATEGORIA: {category || room.gameData.category}</span>
              <span>•</span>
              <span>
                🕵️ {room.gameData.aliveImpostorsCount ?? room.settings.impostors}{" "}
                {(room.gameData.aliveImpostorsCount ??
                  room.settings.impostors) === 1
                  ? "IMPOSTOR"
                  : "IMPOSTORES"}
              </span>
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">
              💬 Hora do Debate!
            </h2>
            <p className="text-sm font-extrabold text-[#1B3A63]">
              Compare as dicas abaixo e discuta no chat quem deu a pista mais suspeita!
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPeekRole((v) => !v)}
              aria-label={
                peekRole ? "Ocultar meu papel secreto" : "Espiar meu papel secreto"
              }
              className="min-h-[48px] px-3.5 rounded-[18px] bg-[#F6EFE0] text-[#0B0E1F] font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
            >
              {peekRole ? (
                <>
                  <EyeOff className="w-4 h-4 stroke-[2.8]" />
                  <span>Ocultar Papel</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 stroke-[2.8]" />
                  <span>Meu Papel</span>
                </>
              )}
            </button>

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
        </div>

        {peekRole && (
          <div
            className={`rounded-[18px] border-3 border-[#0B0E1F] px-4 py-2.5 font-extrabold text-sm animate-pop-in ${
              myRole === "impostor"
                ? "bg-[#FF7A45] text-[#0B0E1F]"
                : "bg-[#63D2B0] text-[#0B0E1F]"
            }`}
          >
            {myRole === "impostor" ? (
              <span>
                🕵️ Você é o <strong>IMPOSTOR</strong>! Blefe no debate sem parecer perdido.
              </span>
            ) : (
              <span>
                ✨ Você é <strong>INOCENTE</strong> • Palavra secreta:{" "}
                <strong className="underline">{secretWord || "---"}</strong>
              </span>
            )}
          </div>
        )}
      </section>

      {/* Resumo compacto das Dicas da Rodada para consulta */}
      <section
        aria-label="Resumo das dicas dadas na rodada"
        className="bg-[#F6EFE0] text-[#0B0E1F] rounded-[24px] border-4 border-[#0B0E1F] shadow-[0_6px_0_#0B0E1F] p-4"
      >
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#5A6785] mb-2.5">
          📌 Dicas desta rodada:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {hintsToShow.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-2.5 bg-[#F2E8D2] rounded-[18px] border-2 border-[#0B0E1F] px-3 py-2"
            >
              <Avatar
                avatar={h.avatar}
                size={36}
                label={`Avatar de ${h.nickname}`}
              />
              <div className="min-w-0">
                <div className="font-display font-bold text-xs text-[#0E1230] truncate">
                  {h.nickname}
                </div>
                <div
                  className={`text-sm font-extrabold truncate ${
                    h.timedOut ? "italic text-[#8C7AA8]" : "text-[#0B0E1F]"
                  }`}
                >
                  “{h.text}”
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Painel Principal do Chat */}
      <DebateChatPanel
        messages={room.gameData.chatMessages || []}
        myPlayerId={myPlayerId}
        canSend={amIAlive}
        onSendMessage={onSendChat}
      />

      {/* Barra Inferior: Pular / Ir para Votação */}
      <section className="bg-[#0A0D24] rounded-[24px] border-4 border-[#0B0E1F] shadow-[0_6px_0_#0B0E1F] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm font-extrabold text-[#C7D2EA]">
          <span>
            Já decidiu seu suspeito? Quando todos marcarem pronto, a votação abre na hora!
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {amIAlive && (
            <button
              type="button"
              onClick={onToggleSkipDebate}
              aria-pressed={amIReadyToVote}
              aria-label="Sinalizar pronto para ir para a votação"
              className={`flex-1 sm:flex-initial min-h-[50px] px-5 rounded-[18px] font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 border-3 border-[#0B0E1F] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020] ${
                amIReadyToVote
                  ? "bg-[#63D2B0] text-[#0B0E1F] shadow-[0_4px_0_#0B0E1F]"
                  : "bg-[#FFB020] text-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] hover:brightness-105 active:translate-y-0.5 active:shadow-none"
              }`}
            >
              {amIReadyToVote ? (
                <>
                  <CheckCircle2 className="w-5 h-5 stroke-[2.8]" />
                  <span>
                    Pronto! ({skipIds.length}/{aliveConnectedCount})
                  </span>
                </>
              ) : (
                <>
                  <Vote className="w-5 h-5 stroke-[2.8]" />
                  <span>
                    Ir para Votação ({skipIds.length}/{aliveConnectedCount})
                  </span>
                </>
              )}
            </button>
          )}

          {isHost && (
            <button
              type="button"
              onClick={onForceEndDebate}
              aria-label="Encerrar debate agora e abrir votação imediatamente"
              title="Anfitrião: abrir votação agora"
              className="min-h-[50px] px-4 rounded-[18px] bg-[#FF7A45] text-[#0B0E1F] font-display font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
            >
              <FastForward className="w-4 h-4 stroke-[2.8]" />
              <span>Votar Agora</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
