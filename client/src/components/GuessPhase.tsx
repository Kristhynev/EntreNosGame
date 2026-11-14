import React, { useState } from "react";
import { Clock, Crosshair } from "lucide-react";
import type { RoomState } from "../types/game";
import { useCountdown } from "../lib/useCountdown";
import { Avatar } from "./Avatar";

export interface GuessPhaseProps {
  room: RoomState;
  myPlayerId: string;
  onGuessWord: (word: string) => void;
}

export function GuessPhase({
  room,
  myPlayerId,
  onGuessWord,
}: GuessPhaseProps) {
  const [guessInput, setGuessInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const secondsLeft = useCountdown(room.gameData.phaseEndsAt);

  const guessingId = room.gameData.guessingImpostorId;
  const impostor = room.players.find((p) => p.id === guessingId);
  const isMeGuessing = myPlayerId === guessingId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = guessInput.trim();
    if (!cleaned || !isMeGuessing || submitted) return;
    setSubmitted(true);
    onGuessWord(cleaned);
  };

  return (
    <div className="space-y-5">
      <section className="bg-[#FF7A45] text-[#0B0E1F] rounded-[28px] border-4 border-[#0B0E1F] shadow-[0_8px_0_#0B0E1F] p-6 sm:p-8 text-center space-y-5 animate-pop-in">
        <div className="flex items-center justify-center gap-3">
          <span className="px-3.5 py-1 rounded-full bg-[#0B0E1F] text-[#FFB020] font-display font-bold text-xs uppercase tracking-wider">
            ÚLTIMA CHANCE DO IMPOSTOR • CATEGORIA: {room.gameData.category}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          {impostor && (
            <Avatar
              avatar={impostor.avatar}
              size={104}
              label={`Avatar do impostor ${impostor.nickname}`}
            />
          )}

          <div
            aria-live="polite"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[20px] bg-[#FFB020] text-[#0B0E1F] font-display font-bold text-2xl border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] animate-pulse"
          >
            <Clock className="w-6 h-6 stroke-[3]" />
            <span>{secondsLeft}s restantes</span>
          </div>

          {isMeGuessing ? (
            <div className="max-w-md w-full space-y-3 pt-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                🎯 Desmascarado! Mas ainda dá pra vencer!
              </h2>
              <p className="text-sm font-extrabold">
                Adivinhe a palavra secreta em até 20 segundos para roubar a vitória para os Impostores!
              </p>

              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <input
                  type="text"
                  maxLength={35}
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="Qual é a palavra secreta?"
                  aria-label="Digite seu palpite da palavra secreta"
                  autoFocus
                  className="w-full min-h-[54px] px-4 rounded-[20px] bg-white text-[#0B0E1F] text-center font-display font-bold text-xl border-3 border-[#0B0E1F] focus:outline-none focus:ring-4 focus:ring-[#FFB020]"
                />
                <button
                  type="submit"
                  disabled={!guessInput.trim() || submitted}
                  aria-label="Enviar palpite final da palavra secreta"
                  className="w-full min-h-[56px] px-6 rounded-[20px] bg-[#FFB020] text-[#0B0E1F] font-display font-bold text-lg inline-flex items-center justify-center gap-2 border-3 border-[#0B0E1F] shadow-[0_5px_0_#0B0E1F] hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
                >
                  <Crosshair className="w-5 h-5 stroke-[2.8]" />
                  <span>CHUTAR PALAVRA E VIRAR O JOGO!</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="max-w-lg space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                😱 Suspense na Pista!
              </h2>
              <p className="text-base font-extrabold">
                <strong>{impostor?.nickname || "O Impostor"}</strong> foi
                descoberto e tem 20 segundos para tentar adivinhar a palavra secreta!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Dicas dadas até agora para consulta */}
      <section className="bg-[#1A2145] rounded-[24px] border-4 border-[#0B0E1F] p-4 sm:p-5">
        <h3 className="font-display font-bold text-base text-[#FFB020] mb-2.5">
          Dicas ditas na partida:
        </h3>
        <div className="flex flex-wrap gap-2">
          {room.gameData.hints.map((h) => (
            <span
              key={h.id}
              className="px-3 py-1.5 rounded-2xl bg-[#F6EFE0] text-[#0B0E1F] border-2 border-[#0B0E1F] text-xs font-extrabold"
            >
              <strong>{h.nickname}:</strong> “{h.text}”
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
