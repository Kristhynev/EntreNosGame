import React from "react";
import { LogOut } from "lucide-react";
import type {
  GameOverPayload,
  RoomState,
  VoteResultPayload,
} from "../types/game";
import { HintPhase } from "./HintPhase";
import { DebatePhase } from "./DebatePhase";
import { VotingPhase } from "./VotingPhase";
import { GuessPhase } from "./GuessPhase";
import { ResultScreen } from "./ResultScreen";
import { DebateChatPanel } from "./DebateChatPanel";

export interface GameScreenProps {
  room: RoomState;
  myPlayerId: string;
  myRole: "crew" | "impostor";
  secretWord: string | null;
  category: string;
  voteResult: VoteResultPayload | null;
  gameOverResult: GameOverPayload | null;
  onSendHint: (text: string) => void;
  onSendChat: (text: string) => void;
  onToggleSkipDebate: () => void;
  onForceEndDebate: () => void;
  onVote: (targetPlayerId: string | "skip") => void;
  onGuessWord: (word: string) => void;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

export function GameScreen({
  room,
  myPlayerId,
  myRole,
  secretWord,
  category,
  voteResult,
  gameOverResult,
  onSendHint,
  onSendChat,
  onToggleSkipDebate,
  onForceEndDebate,
  onVote,
  onGuessWord,
  onPlayAgain,
  onLeaveRoom,
}: GameScreenProps) {
  return (
    <div className="relative z-10 min-h-dvh flex flex-col pb-10">
      {/* Header compacto durante a partida */}
      <header className="sticky top-0 z-30 bg-[#0A0D24]/95 backdrop-blur-md border-b-4 border-[#0B0E1F] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-lg sm:text-xl font-bold text-white">
              🕵️ ENTRE <span className="text-[#FFB020]">NÓS</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFB020] text-[#0B0E1F] font-display font-bold text-xs border-2 border-[#0B0E1F]">
              CASO {room.roomCode}
            </span>
          </div>

          <button
            type="button"
            onClick={onLeaveRoom}
            aria-label="Abandonar partida e sair da sala"
            title="Sair da sala"
            className="min-h-[44px] px-3.5 rounded-2xl bg-[#E23B2E] text-white font-display font-bold text-xs inline-flex items-center gap-1.5 border-3 border-[#0B0E1F] shadow-[0_3px_0_#0B0E1F] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
          >
            <LogOut className="w-4 h-4 stroke-[2.8]" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-5">
        {room.status === "playing" && (
          <HintPhase
            room={room}
            myPlayerId={myPlayerId}
            myRole={myRole}
            secretWord={secretWord}
            category={category}
            onSendHint={onSendHint}
          />
        )}

        {room.status === "debate" && (
          <DebatePhase
            room={room}
            myPlayerId={myPlayerId}
            myRole={myRole}
            secretWord={secretWord}
            category={category}
            onSendChat={onSendChat}
            onToggleSkipDebate={onToggleSkipDebate}
            onForceEndDebate={onForceEndDebate}
          />
        )}

        {room.status === "voting" && (
          <VotingPhase
            room={room}
            myPlayerId={myPlayerId}
            voteResult={voteResult || room.gameData.lastVoteResult}
            onVote={onVote}
            onSendChat={onSendChat}
          />
        )}

        {room.status === "guess" && (
          <GuessPhase
            room={room}
            myPlayerId={myPlayerId}
            onGuessWord={onGuessWord}
          />
        )}

        {room.status === "ended" && (
          <div className="space-y-6">
            <ResultScreen
              room={room}
              myPlayerId={myPlayerId}
              result={gameOverResult}
              onPlayAgain={onPlayAgain}
              onLeaveRoom={onLeaveRoom}
            />

            {room.settings.debateEnabled && (
              <DebateChatPanel
                messages={room.gameData.chatMessages || []}
                myPlayerId={myPlayerId}
                canSend
                compact
                onSendMessage={onSendChat}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
