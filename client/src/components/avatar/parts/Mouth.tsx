import React from "react";
import type { MouthVariant } from "../../../types/game";

const INK = "#0B0E1F";

export const MOUTH_VARIANTS: Record<MouthVariant, () => React.ReactNode> = {
  /* Sorriso torto de quem está blefando */
  mouth_smile: () => (
    <g>
      <path
        d="M50 75 Q59 81 69 73.5"
        fill="none"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M69 73.5 Q71.5 72.5 70.5 75.5"
        fill="none"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </g>
  ),

  /* Riso aberto / deboche */
  mouth_grin: () => (
    <g>
      <path
        d="M48 72 Q60 71.5 72 72 C72 83, 48 83, 48 72 Z"
        fill="#5A1C1C"
        stroke={INK}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M50 72.6 L70 72.6 L69 76 L51 76 Z" fill="#EFE6D2" />
      <path d="M55 79.5 Q60 77 65 79.5" fill="#B8503F" />
    </g>
  ),

  /* Linha reta — não vai entregar nada */
  mouth_neutral: () => (
    <g>
      <line
        x1="51"
        y1="76"
        x2="69"
        y2="75.6"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="51"
        y1="79"
        x2="69"
        y2="78.7"
        stroke={INK}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.3"
      />
    </g>
  ),

  /* Suspiro / "eu não fui" */
  mouth_surprised: () => (
    <g>
      <ellipse
        cx="60"
        cy="77"
        rx="5.4"
        ry="6.4"
        fill="#5A1C1C"
        stroke={INK}
        strokeWidth="2.6"
      />
      <ellipse cx="60" cy="80" rx="3.2" ry="2.2" fill="#B8503F" />
    </g>
  ),

  /* Língua de deboche */
  mouth_tongue: () => (
    <g>
      <path
        d="M50 74 Q60 80 70 74"
        fill="none"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M57 77 L57 82 C57 85.5, 64 85.5, 64 82 L64 76.5 Z"
        fill="#B8503F"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </g>
  ),

  /* Derrotado, caso encerrado */
  mouth_sad: () => (
    <g>
      <path
        d="M51 80 Q60 72.5 69 80"
        fill="none"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M52 82.5 Q58 80.5 62 82"
        fill="none"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.35"
      />
    </g>
  ),
};

export function Mouth({ variant }: { variant: MouthVariant }) {
  const renderer = MOUTH_VARIANTS[variant] || MOUTH_VARIANTS.mouth_smile;
  return <>{renderer()}</>;
}
