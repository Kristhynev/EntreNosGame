import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import type { ChatMessage } from "../types/game";
import { Avatar } from "./Avatar";

const QUICK_PROMPTS = [
  "🤨 Dica muito suspeita!",
  "❓ Explica melhor essa dica!",
  "🛡️ Acho que é inocente",
  "👀 Já sei quem é o Impostor!",
];

export interface DebateChatPanelProps {
  messages: ChatMessage[];
  myPlayerId: string;
  canSend: boolean;
  disabledReason?: string;
  compact?: boolean;
  onSendMessage: (text: string) => void;
}

export function DebateChatPanel({
  messages,
  myPlayerId,
  canSend,
  disabledReason,
  compact = false,
  onSendMessage,
}: DebateChatPanelProps) {
  const [text, setText] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = text.trim();
    if (!cleaned || !canSend) return;
    onSendMessage(cleaned);
    setText("");
  };

  const handleQuickPrompt = (promptText: string) => {
    if (!canSend) return;
    onSendMessage(promptText);
  };

  return (
    <section
      aria-label="Chat de debate da rodada"
      className="bg-[#1A2145] text-white rounded-[26px] border-4 border-[#0B0E1F] shadow-[0_7px_0_#0B0E1F] overflow-hidden flex flex-col"
    >
      {/* Cabeçalho do Chat */}
      <div className="px-4 sm:px-5 py-3 bg-[#0E1230] border-b-3 border-[#0B0E1F] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#FFB020]">
          <MessageSquare className="w-5 h-5 stroke-[2.8]" />
          <h3 className="font-display font-bold text-base sm:text-lg">
            Chat do Debate ({messages.length})
          </h3>
        </div>
        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#63D2B0] text-[#0B0E1F] border border-[#0B0E1F]">
          Ao vivo
        </span>
      </div>

      {/* Lista de Mensagens */}
      <div
        ref={scrollContainerRef}
        aria-live="polite"
        className={`overflow-y-auto p-3.5 sm:p-4 space-y-2.5 bg-[#261659]/70 ${
          compact ? "max-h-[240px] min-h-[160px]" : "max-h-[340px] min-h-[220px]"
        }`}
      >
        {messages.length === 0 ? (
          <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center px-4">
            <p className="font-display font-bold text-base text-[#FFB020]">
              💬 A roda de debate está aberta!
            </p>
            <p className="text-xs sm:text-sm font-bold text-[#9FB0D0] mt-1 max-w-md">
              Questione as dicas suspeitas, defenda sua inocência ou blefe com estilo antes de votar!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.playerId === myPlayerId;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 animate-pop-in ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar
                  avatar={msg.avatar}
                  size={38}
                  label={`Avatar de ${msg.nickname}`}
                />

                <div
                  className={`max-w-[78%] sm:max-w-[72%] rounded-[20px] border-3 border-[#0B0E1F] px-3.5 py-2 shadow-[0_3px_0_#0B0E1F] ${
                    isMe
                      ? "bg-[#FFB020] text-[#0B0E1F] rounded-br-md"
                      : "bg-[#F6EFE0] text-[#0B0E1F] rounded-bl-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-display font-bold text-xs text-[#0E1230] truncate">
                      {isMe ? `${msg.nickname} (Você)` : msg.nickname}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#6A7794] shrink-0">
                      R{msg.round}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold break-words leading-snug">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Área de Envio / Frases Rápidas */}
      <div className="p-3 sm:p-4 bg-[#1A2145] border-t-3 border-[#0B0E1F] space-y-2.5">
        {canSend ? (
          <>
            {/* Frases rápidas de 1 toque */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_PROMPTS.map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => handleQuickPrompt(promptText)}
                  className="px-3 py-1.5 rounded-full bg-[#0E1230] hover:bg-[#2A3566] text-[#FFB020] text-xs font-extrabold border-2 border-[#0B0E1F] whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB020]"
                >
                  {promptText}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={180}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 180))}
                placeholder="Escreva no debate (sem revelar a palavra secreta)..."
                aria-label="Mensagem para o chat do debate"
                className="flex-1 min-h-[48px] px-4 rounded-[18px] bg-[#F6EFE0] text-[#0B0E1F] font-bold text-sm sm:text-base border-3 border-[#0B0E1F] focus:outline-none focus:ring-4 focus:ring-[#FFB020]"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                aria-label="Enviar mensagem no debate"
                className="min-h-[48px] px-5 rounded-[18px] bg-[#63D2B0] text-[#0B0E1F] font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-1.5 border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
              >
                <Send className="w-4 h-4 stroke-[2.8]" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>
          </>
        ) : (
          <p className="text-xs sm:text-sm font-extrabold text-[#FFB020] text-center py-1">
            {disabledReason ||
              "👻 Você foi eliminado e está acompanhando o debate como espectador."}
          </p>
        )}
      </div>
    </section>
  );
}
