import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Vote,
} from "lucide-react";
import type { RoomState, VoteResultPayload } from "../types/game";
import { useCountdown } from "../lib/useCountdown";
import { Avatar } from "./Avatar";
import { DebateChatPanel } from "./DebateChatPanel";

export interface VotingPhaseProps {
  room: RoomState;
  myPlayerId: string;
  voteResult: VoteResultPayload | null;
  onVote: (targetPlayerId: string | "skip") => void;
  onSendChat: (text: string) => void;
}

export function VotingPhase({
  room,
  myPlayerId,
  voteResult,
  onVote,
  onSendChat,
}: VotingPhaseProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | "skip" | null>(
    null
  );
  const [showChatInVoting, setShowChatInVoting] = useState(true);
  const secondsLeft = useCountdown(room.gameData.phaseEndsAt);

  const me = room.players.find((p) => p.id === myPlayerId);
  const amIAlive = Boolean(me?.isAlive);
  const hasAlreadyVoted = room.gameData.votedPlayerIds.includes(myPlayerId);
  const alivePlayers = room.players.filter((p) => p.isAlive);
  const chatMessages = room.gameData.chatMessages || [];

  // Se já saiu a apuração da votação, exibe a tela dramática de resultado da rodada
  if (voteResult) {
    return (
      <section
        aria-live="assertive"
        className="bg-[#F6EFE0] text-[#0B0E1F] rounded-[28px] border-4 border-[#0B0E1F] shadow-[0_8px_0_#0B0E1F] p-6 sm:p-8 text-center space-y-5 animate-pop-in"
      >
        <span className="inline-block px-4 py-1 rounded-full bg-[#0E1230] text-[#FFB020] font-display font-bold text-xs uppercase tracking-wider">
          Resultado da Votação • Rodada {room.gameData.round}
        </span>

        {voteResult.eliminatedPlayer ? (
          <div className="flex flex-col items-center space-y-3">
            <Avatar
              avatar={voteResult.eliminatedPlayer.avatar}
              size={96}
              label={`Avatar de ${voteResult.eliminatedPlayer.nickname}`}
            />
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              {voteResult.eliminatedPlayer.nickname} foi eliminado(a)!
            </h2>
            <div
              className={`px-5 py-2 rounded-2xl border-3 border-[#0B0E1F] font-display font-bold text-lg shadow-[0_4px_0_#0B0E1F] ${
                voteResult.wasImpostor
                  ? "bg-[#FF7A45] text-[#0B0E1F]"
                  : "bg-[#4C8DFF] text-[#0B0E1F]"
              }`}
            >
              {voteResult.wasImpostor
                ? "🕵️ ERA IMPOSTOR! Agora tem 20s para tentar adivinhar a palavra!"
                : "😱 Era um INOCENTE! O Impostor continua no caso..."}
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              {voteResult.tie
                ? "⚖️ Empate na votação!"
                : "🤷 Votação pulada pela maioria!"}
            </h2>
            <p className="font-bold text-[#5A6785]">
              Ninguém foi eliminado nesta rodada. Preparando próxima rodada de dicas...
            </p>
          </div>
        )}

        {/* Placar de votos recebidos */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
          {Object.entries(voteResult.tally).map(([targetId, count]) => {
            const p = room.players.find((pl) => pl.id === targetId);
            const label =
              targetId === "skip" ? "Pular voto" : p?.nickname || "Jogador";
            return (
              <span
                key={targetId}
                className="px-3.5 py-1.5 rounded-2xl bg-[#F3E6C3] border-2 border-[#0B0E1F] font-extrabold text-sm"
              >
                {label}: {count} {count === 1 ? "voto" : "votos"}
              </span>
            );
          })}
        </div>
      </section>
    );
  }

  const handleConfirmVote = () => {
    if (!selectedTarget || !amIAlive || hasAlreadyVoted) return;
    onVote(selectedTarget);
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho da Votação */}
      <section className="bg-[#FFB020] text-[#0B0E1F] rounded-[26px] border-4 border-[#0B0E1F] shadow-[0_7px_0_#0B0E1F] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex flex-wrap items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#0B0E1F] text-[#FFB020]">
            <span>HORA DA VERDADE • RODADA {room.gameData.round}</span>
            <span>•</span>
            <span>
              🕵️ RESTAM{" "}
              {room.gameData.aliveImpostorsCount ?? room.settings.impostors}
            </span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">
            {(room.gameData.aliveImpostorsCount ?? room.settings.impostors) > 1
              ? "🗳️ Quem é um dos Impostores?"
              : "🗳️ Quem é o Impostor?"}
          </h2>
          <p className="text-sm font-extrabold text-[#4A3A10]">
            Analise as dicas dadas e escolha o convidado mais suspeito!
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {room.settings.debateEnabled && (
            <button
              type="button"
              onClick={() => setShowChatInVoting((v) => !v)}
              aria-expanded={showChatInVoting}
              aria-label={
                showChatInVoting
                  ? "Recolher chat do debate"
                  : "Expandir chat do debate"
              }
              className="min-h-[48px] px-3.5 rounded-[18px] bg-[#4C8DFF] text-[#0B0E1F] font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45]"
            >
              <MessageSquare className="w-4 h-4 stroke-[2.8]" />
              <span>Chat ({chatMessages.length})</span>
              {showChatInVoting ? (
                <ChevronUp className="w-4 h-4 stroke-[2.8]" />
              ) : (
                <ChevronDown className="w-4 h-4 stroke-[2.8]" />
              )}
            </button>
          )}

          <div
            aria-live="polite"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-[20px] font-display font-bold text-xl border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] ${
              secondsLeft <= 10
                ? "bg-[#E23B2E] text-white animate-pulse"
                : "bg-[#F6EFE0] text-[#0B0E1F]"
            }`}
          >
            <Clock className="w-5 h-5 stroke-[2.8]" />
            <span>{secondsLeft}s</span>
          </div>
        </div>
      </section>

      {/* Grade de Suspeitos Vivos */}
      <section aria-label="Escolha em quem votar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {alivePlayers.map((candidate) => {
            const isSelected = selectedTarget === candidate.id;
            const candidateVoted = room.gameData.votedPlayerIds.includes(
              candidate.id
            );
            const playerHints = room.gameData.hints.filter(
              (h) => h.playerId === candidate.id
            );
            const latestHint = playerHints[playerHints.length - 1];

            return (
              <button
                key={candidate.id}
                type="button"
                disabled={!amIAlive || hasAlreadyVoted}
                onClick={() => setSelectedTarget(candidate.id)}
                aria-pressed={isSelected}
                aria-label={`Votar em ${candidate.nickname}${
                  candidate.id === myPlayerId ? " (você)" : ""
                }`}
                className={`relative text-left flex items-center gap-3.5 p-4 rounded-[24px] border-4 border-[#0B0E1F] transition-all min-h-[100px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45] ${
                  isSelected
                    ? "bg-[#FF7A45] text-[#0B0E1F] shadow-[0_6px_0_#0B0E1F] -translate-y-1"
                    : "bg-[#F6EFE0] text-[#0B0E1F] shadow-[0_5px_0_#0B0E1F] hover:bg-[#F3E6C3]"
                } ${
                  !amIAlive || hasAlreadyVoted
                    ? "opacity-90 cursor-default"
                    : "cursor-pointer"
                }`}
              >
                <Avatar
                  avatar={candidate.avatar}
                  size={60}
                  label={`Avatar de ${candidate.nickname}`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-lg truncate">
                      {candidate.nickname}
                    </span>
                    {candidate.id === myPlayerId && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#0B0E1F] text-[#FFB020]">
                        VOCÊ
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-extrabold text-[#48526B] mt-0.5 truncate">
                    Dica: “{latestHint ? latestHint.text : "---"}”
                  </p>

                  {candidateVoted && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#63D2B0] text-[#0B0E1F] border border-[#0B0E1F]">
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                      Já votou
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Opção Pular Voto + Botão Confirmar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1A2145] rounded-[24px] border-4 border-[#0B0E1F] p-4 shadow-[0_6px_0_#0B0E1F]">
        {!amIAlive ? (
          <p className="text-sm font-extrabold text-[#FFB020]">
            👻 Você foi eliminado e está acompanhando a votação dos jogadores vivos.
          </p>
        ) : hasAlreadyVoted ? (
          <div className="flex items-center gap-2 text-[#63D2B0] font-display font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 stroke-[2.8]" />
            <span>
              Voto registrado! ({room.gameData.votedPlayerIds.length}/
              {alivePlayers.filter((p) => p.connected).length} votaram)
            </span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setSelectedTarget("skip")}
              aria-pressed={selectedTarget === "skip"}
              aria-label="Selecionar pular voto em branco"
              className={`min-h-[50px] px-4 rounded-[18px] font-display font-bold text-sm sm:text-base border-3 border-[#0B0E1F] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020] ${
                selectedTarget === "skip"
                  ? "bg-[#4C8DFF] text-[#0B0E1F] shadow-[0_4px_0_#0B0E1F]"
                  : "bg-[#F6EFE0] text-[#0B0E1F] hover:bg-[#DDE9F8]"
              }`}
            >
              🤷 Em Dúvida (Pular Voto)
            </button>

            <button
              type="button"
              disabled={!selectedTarget}
              onClick={handleConfirmVote}
              aria-label="Confirmar meu voto"
              className="min-h-[54px] px-7 rounded-[20px] bg-[#63D2B0] text-[#0B0E1F] font-display font-bold text-lg inline-flex items-center justify-center gap-2 border-3 border-[#0B0E1F] shadow-[0_5px_0_#0B0E1F] hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
            >
              <Vote className="w-5 h-5 stroke-[2.8]" />
              <span>CONFIRMAR VOTO</span>
            </button>
          </>
        )}
      </section>

      {/* Chat do Debate durante a votação (se ativado nas regras) */}
      {room.settings.debateEnabled && showChatInVoting && (
        <DebateChatPanel
          messages={chatMessages}
          myPlayerId={myPlayerId}
          canSend={amIAlive}
          compact
          onSendMessage={onSendChat}
        />
      )}
    </div>
  );
}
