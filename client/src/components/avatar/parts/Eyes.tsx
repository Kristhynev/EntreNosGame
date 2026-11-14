import React from "react";
import type { EyesVariant } from "../../../types/game";

const INK = "#0B0E1F";
const SCLERA = "#EFE6D2";

function Brows({ angry = false }: { angry?: boolean }) {
  if (angry) {
    return (
      <g stroke={INK} strokeWidth="3" strokeLinecap="round">
        <line x1="39" y1="47" x2="53" y2="52" />
        <line x1="81" y1="47" x2="67" y2="52" />
      </g>
    );
  }
  return (
    <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" opacity="0.9">
      <path d="M39 49 Q46 45 53 48" fill="none" />
      <path d="M67 48 Q74 45 81 49" fill="none" />
    </g>
  );
}

function EyeBall({
  cx,
  cy,
  r = 6,
  look = 2,
}: {
  cx: number;
  cy: number;
  r?: number;
  look?: number;
}) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.92} fill={SCLERA} stroke={INK} strokeWidth="2.4" />
      <circle cx={cx + look} cy={cy} r={r * 0.46} fill={INK} />
      <circle cx={cx + look - 1.6} cy={cy - 1.8} r={r * 0.17} fill="#FFFFFF" />
      {/* sombra da pálpebra */}
      <path
        d={`M${cx - r} ${cy - r * 0.55} Q${cx} ${cy - r * 1.15} ${cx + r} ${cy - r * 0.55}`}
        fill={INK}
        opacity="0.22"
      />
    </g>
  );
}

export const EYES_VARIANTS: Record<EyesVariant, () => React.ReactNode> = {
  /* Cansado — olhos semicerrados de quem passou a noite no caso */
  eyes_happy: () => (
    <g>
      <Brows />
      <path d="M40 59 Q46 54 52 59" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M68 59 Q74 54 80 59" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <g fill={INK} opacity="0.35">
        <circle cx="44" cy="63" r="1.1" />
        <circle cx="47" cy="64" r="1" />
        <circle cx="72" cy="64" r="1" />
        <circle cx="76" cy="63" r="1.1" />
      </g>
    </g>
  ),

  /* Piscadela de quem sabe de algo */
  eyes_wink: () => (
    <g>
      <Brows />
      <EyeBall cx={46} cy={58} look={1.5} />
      <path d="M68 56 L74 59 L68 62" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),

  /* Sonolento */
  eyes_sleepy: () => (
    <g>
      <Brows />
      <path d="M40 60 Q46 57 52 60" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M68 60 Q74 57 80 60" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M40 60 A6 5 0 0 0 52 60 Z" fill={INK} opacity="0.85" />
      <path d="M68 60 A6 5 0 0 0 80 60 Z" fill={INK} opacity="0.85" />
    </g>
  ),

  /* Em choque / flagrado */
  eyes_star: () => (
    <g>
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
        <path d="M39 47 Q46 43 53 46" fill="none" />
        <path d="M67 46 Q74 43 81 47" fill="none" />
      </g>
      <EyeBall cx={46} cy={58} r={6.6} look={0} />
      <EyeBall cx={74} cy={58} r={6.6} look={0} />
      <path d="M42.5 55.5 L44 53.5 M72.5 55.5 L74 53.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),

  /* Desconfiado */
  eyes_angry: () => (
    <g>
      <Brows angry />
      <EyeBall cx={46} cy={59} r={5.4} look={2.2} />
      <EyeBall cx={74} cy={59} r={5.4} look={2.2} />
      <line x1="39" y1="65" x2="52" y2="65" stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
      <line x1="68" y1="65" x2="81" y2="65" stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
    </g>
  ),

  /* Inocente de fachada */
  eyes_cute: () => (
    <g>
      <Brows />
      <EyeBall cx={46} cy={58} r={6.4} look={0.6} />
      <EyeBall cx={74} cy={58} r={6.4} look={0.6} />
      <path d="M41 52 Q46 50 51 52" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M69 52 Q74 50 79 52" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </g>
  ),

  /* Atento — olhar lateral de quem observa */
  eyes_round: () => (
    <g>
      <Brows />
      <EyeBall cx={46} cy={58} r={5.8} look={3} />
      <EyeBall cx={74} cy={58} r={5.8} look={3} />
    </g>
  ),

  /* Olhar frio, sem sobrancelha franzida */
  eyes_cool: () => (
    <g>
      <path d="M39 49 L53 49" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M67 47 Q74 44 81 48" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      <ellipse cx="46" cy="58.5" rx="5.6" ry="3.8" fill={INK} />
      <circle cx="44.4" cy="57.2" r="1.4" fill="#FFFFFF" />
      <ellipse cx="74" cy="58.5" rx="5.6" ry="3.8" fill={INK} />
      <circle cx="72.4" cy="57.2" r="1.4" fill="#FFFFFF" />
    </g>
  ),
};

export function Eyes({ variant }: { variant: EyesVariant }) {
  const renderer = EYES_VARIANTS[variant] || EYES_VARIANTS.eyes_happy;
  return <>{renderer()}</>;
}
