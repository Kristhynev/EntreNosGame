import React from "react";

/* Cartas de baralho espalhadas pela mesa de investigação */
const FLOATING_CARDS = [
  { left: "4%", top: "22%", rank: "A", suit: "♠", rot: "-14deg", delay: "0s", duration: "11s" },
  { left: "88%", top: "14%", rank: "K", suit: "♦", rot: "12deg", delay: "1.6s", duration: "13s" },
  { left: "14%", top: "72%", rank: "Q", suit: "♣", rot: "8deg", delay: "0.8s", duration: "12s" },
  { left: "82%", top: "68%", rank: "J", suit: "♥", rot: "-9deg", delay: "2.4s", duration: "14s" },
  { left: "48%", top: "6%", rank: "7", suit: "♠", rot: "5deg", delay: "1.1s", duration: "15s" },
];

const CASE_PAPERS = [
  { left: "9%", top: "46%", rot: "-16deg", delay: "0.4s" },
  { left: "72%", top: "40%", rot: "14deg", delay: "1.9s" },
  { left: "38%", top: "84%", rot: "-6deg", delay: "1.2s" },
];

export function PartyBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      {/* Base navy profunda */}
      <div className="absolute inset-0 bg-[#0E1230]" />

      {/* Holofotes de interrogatório */}
      <div className="noir-spotlight absolute inset-0" />
      <div className="noir-spotlight-beam absolute -top-40 left-1/2 h-[130vh] w-[52vw] -translate-x-1/2 bg-gradient-to-b from-[#FFB020]/22 via-[#FF7A1A]/10 to-transparent blur-[2px]" />

      {/* Faixa vermelha diagonal (identidade visual do caso) */}
      <div className="absolute -left-1/4 top-1/3 h-24 w-[150%] -rotate-12 bg-[#E23B2E]/12" />
      <div className="absolute -left-1/4 bottom-10 h-14 w-[150%] -rotate-12 bg-[#FF7A1A]/10" />

      {/* Textura de grão de filme */}
      <div className="noir-grain absolute inset-0 opacity-40" />

      {/* Cartas flutuantes */}
      {FLOATING_CARDS.map((card, idx) => (
        <div
          key={idx}
          className="party-balloon absolute hidden sm:block"
          style={
            {
              left: card.left,
              top: card.top,
              "--card-rot": card.rot,
              animationDelay: card.delay,
              animationDuration: card.duration,
            } as React.CSSProperties
          }
        >
          <div className="w-14 rounded-[8px] border-2 border-[#0B0E1F] bg-[#F6EFE0] px-1.5 py-1 shadow-[0_6px_0_rgba(11,14,31,0.45)] opacity-70">
            <div className="font-display text-lg leading-none text-[#0B0E1F]">
              {card.rank}
            </div>
            <div
              className={`text-sm leading-none ${
                card.suit === "♥" || card.suit === "♦"
                  ? "text-[#E23B2E]"
                  : "text-[#0B0E1F]"
              }`}
            >
              {card.suit}
            </div>
          </div>
        </div>
      ))}

      {/* Fichas de caso em papel */}
      {CASE_PAPERS.map((paper, idx) => (
        <div
          key={`paper-${idx}`}
          className="party-confetti-float absolute hidden md:block w-24 h-16 rounded-[3px] bg-[#F2E8D2]/12 border border-[#F2E8D2]/20"
          style={{
            left: paper.left,
            top: paper.top,
            transform: `rotate(${paper.rot})`,
            animationDelay: paper.delay,
          }}
        >
          <div className="m-2 h-1 w-10 rounded-full bg-[#F6EFE0]/35" />
          <div className="mx-2 h-1 w-14 rounded-full bg-[#F6EFE0]/20" />
          <div className="mx-2 mt-1.5 h-1 w-8 rounded-full bg-[#F6EFE0]/20" />
        </div>
      ))}

      {/* Lupa decorativa */}
      <div className="absolute bottom-8 right-6 hidden lg:block opacity-35 rotate-12">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="#4C8DFF"
            fillOpacity="0.28"
            stroke="#FFB020"
            strokeWidth="7"
          />
          <circle cx="50" cy="50" r="30" stroke="#0B0E1F" strokeWidth="2.5" />
          <path
            d="M72 72 L102 102"
            stroke="#FFB020"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M72 72 L102 102"
            stroke="#0B0E1F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M35 38 Q41 32 50 31"
            stroke="#F6EFE0"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      </div>
    </div>
  );
}

/* Fragmentos de papel / selos de evidência na comemoração de eventos */
const BURST_PIECES = Array.from({ length: 24 }, (_, i) => {
  const colors = ["#FFB020", "#FF7A1A", "#E23B2E", "#4C8DFF", "#F6EFE0"];
  const angle = (i / 24) * Math.PI * 2;
  const distance = 90 + (i % 4) * 48;
  const tx = Math.round(Math.cos(angle) * distance);
  const ty = Math.round(Math.sin(angle) * distance - 35);
  const rot = (i * 53) % 360;
  return {
    id: i,
    color: colors[i % colors.length],
    tx: `${tx}px`,
    ty: `${ty}px`,
    rot: `${rot}deg`,
    isCard: i % 5 === 0,
  };
});

export function ConfettiBurst({ triggerKey }: { triggerKey: number }) {
  if (!triggerKey) return null;

  return (
    <div
      key={triggerKey}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      <div className="relative w-2 h-2">
        {BURST_PIECES.map((piece) => (
          <span
            key={piece.id}
            className={`confetti-burst-piece absolute left-0 top-0 border border-[#0B0E1F] ${
              piece.isCard ? "w-3.5 h-5 rounded-[2px]" : "w-3 h-2 rounded-xs"
            }`}
            style={
              {
                backgroundColor: piece.color,
                "--tx": piece.tx,
                "--ty": piece.ty,
                "--rot": piece.rot,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
