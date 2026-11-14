import React from "react";
import { LogOut, RotateCcw, Trophy } from "lucide-react";
import type { GameOverPayload, RoomState } from "../types/game";
import { Avatar } from "./Avatar";

export interface ResultScreenProps {
  room: RoomState;
  myPlayerId: string;
  result: GameOverPayload | null;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

export function ResultScreen({
  room,
  myPlayerId,
  result,
  onPlayAgain,
  onLeaveRoom,
}: ResultScreenProps) {
  const summary = result || room.gameData.resultSummary || null;
  const crewWon = summary?.winner === "crew";
  const secretWord = summary?.secretWord || room.gameData.secretWord || "---";
  const impostorIds = summary?.impostorIds || [];
  const impostors = room.players.filter(
    (p) => p.isImpostor || impostorIds.includes(p.id)
  );

  const isHost = room.hostId === myPlayerId;

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Card Principal de Vitória */}
      <section
        className={`rounded-[28px] border-4 border-[#0B0E1F] shadow-[0_9px_0_#0B0E1F] p-6 sm:p-8 text-center space-y-5 ${
          crewWon
            ? "bg-[#63D2B0] text-[#0B0E1F]"
            : "bg-[#FF7A45] text-[#0B0E1F]"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B0E1F] text-[#FFB020] font-display font-bold text-xs sm:text-sm">
          <Trophy className="w-4 h-4 stroke-[2.8]" />
          <span>FIM DE CASO</span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-bold">
          {crewWon ? "CASO RESOLVIDO! INOCENTES VENCERAM" : "IMPOSTORES ESCAPARAM!"}
        </h2>

        {summary?.reason && (
          <p className="text-base sm:text-lg font-extrabold max-w-xl mx-auto">
            {summary.reason}
          </p>
        )}

        {/* Palavra Secreta Revelada */}
        <div className="inline-flex flex-col items-center bg-[#F6EFE0] rounded-[24px] border-3 border-[#0B0E1F] shadow-[0_5px_0_#0B0E1F] px-7 py-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#6A7794]">
            A PALAVRA SECRETA ERA
          </span>
          <span className="font-display text-3xl sm:text-4xl font-bold text-[#0B0E1F] mt-0.5">
            {secretWord}
          </span>
          {summary?.guessAttempt && (
            <span className="mt-1.5 text-xs font-bold text-[#5A6785]">
              Chute do Impostor: “{summary.guessAttempt}”
            </span>
          )}
        </div>

        {/* Destaque de quem era(m) o(s) impostor(es) */}
        <div className="pt-2">
          <h3 className="font-display font-bold text-base uppercase tracking-wider mb-3">
            {impostors.length > 1 ? "Os Impostores eram:" : "O Impostor era:"}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {impostors.map((imp) => (
              <div
                key={imp.id}
                className="flex flex-col items-center bg-[#F6EFE0] rounded-[24px] border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] px-5 py-3.5"
              >
                <Avatar
                  avatar={imp.avatar}
                  size={80}
                  label={`Avatar do impostor ${imp.nickname}`}
                />
                <span className="mt-2 font-display font-bold text-lg text-[#0B0E1F]">
                  {imp.nickname}
                </span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#E23B2E] text-white mt-1">
                  🕵️ Impostor
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botões Jogar Novamente / Sair */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isHost ? (
            <button
              type="button"
              onClick={onPlayAgain}
              aria-label="Jogar novamente e voltar para o lobby"
              className="w-full sm:w-auto min-h-[56px] px-8 rounded-[22px] bg-[#FFB020] text-[#0B0E1F] font-display font-bold text-xl inline-flex items-center justify-center gap-2 border-4 border-[#0B0E1F] shadow-[0_6px_0_#0B0E1F] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
            >
              <RotateCcw className="w-5 h-5 stroke-[3]" />
              <span>Jogar Novamente</span>
            </button>
          ) : (
            <div className="px-6 py-3.5 rounded-[22px] bg-[#F6EFE0] text-[#0B0E1F] font-display font-bold text-base border-3 border-[#0B0E1F]">
              ⏳ Aguardando o anfitrião clicar em “Jogar Novamente”...
            </div>
          )}

          <button
            type="button"
            onClick={onLeaveRoom}
            aria-label="Sair da sala"
            className="w-full sm:w-auto min-h-[54px] px-5 rounded-[22px] bg-[#F6EFE0] text-[#0B0E1F] font-display font-bold text-base inline-flex items-center justify-center gap-2 border-3 border-[#0B0E1F] shadow-[0_5px_0_#0B0E1F] hover:bg-[#F7DDD5] active:translate-y-1 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
          >
            <LogOut className="w-5 h-5 stroke-[2.6]" />
            <span>Sair do Caso</span>
          </button>
        </div>
      </section>

      {/* Elenco Completo da Partida */}
      <section className="bg-[#1A2145] rounded-[26px] border-4 border-[#0B0E1F] shadow-[0_7px_0_#0B0E1F] p-5">
        <h3 className="font-display font-bold text-lg text-[#FFB020] mb-3">
          Papéis de todos na rodada
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {room.players.map((p) => {
            const wasImp = Boolean(p.isImpostor || impostorIds.includes(p.id));
            return (
              <div
                key={p.id}
                className="flex items-center gap-2.5 bg-[#F6EFE0] text-[#0B0E1F] rounded-[20px] border-3 border-[#0B0E1F] p-2.5"
              >
                <Avatar avatar={p.avatar} size={44} label={p.nickname} />
                <div className="min-w-0">
                  <div className="font-display font-bold text-sm truncate">
                    {p.nickname}
                  </div>
                  <span
                    className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      wasImp
                        ? "bg-[#FF7A45] text-[#0B0E1F]"
                        : "bg-[#63D2B0] text-[#0B0E1F]"
                    }`}
                  >
                    {wasImp ? "🕵️ Impostor" : "✨ Inocente"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
