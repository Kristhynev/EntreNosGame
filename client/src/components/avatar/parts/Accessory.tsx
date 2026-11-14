import React from "react";
import type { AccessoryVariant } from "../../../types/game";

const INK = "#0B0E1F";

export const ACCESSORY_VARIANTS: Record<
  AccessoryVariant,
  () => React.ReactNode
> = {
  acc_none: () => null,

  /* Óculos de aro fino de leitura */
  acc_glasses: () => (
    <g>
      <circle cx="46" cy="58" r="10" fill="#EFE6D2" fillOpacity="0.12" stroke={INK} strokeWidth="2.6" />
      <circle cx="74" cy="58" r="10" fill="#EFE6D2" fillOpacity="0.12" stroke={INK} strokeWidth="2.6" />
      <path d="M56 57 Q60 54.5 64 57" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="32" y1="56.5" x2="36" y2="57.5" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="84" y1="57.5" x2="88" y2="56.5" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="41" y1="54" x2="45" y2="51" stroke="#EFE6D2" strokeWidth="2" strokeLinecap="round" />
      <line x1="69" y1="54" x2="73" y2="51" stroke="#EFE6D2" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),

  /* Óculos escuros */
  acc_sunglasses: () => (
    <g>
      <path d="M33 51 H57 Q58 64 45 64 Q34 64 33 51 Z" fill={INK} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M63 51 H87 Q86 64 75 64 Q63 64 63 51 Z" fill={INK} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <line x1="57" y1="54" x2="63" y2="54" stroke={INK} strokeWidth="3.5" />
      <line x1="31" y1="54" x2="34" y2="54" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      <line x1="86" y1="54" x2="89" y2="54" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M38 60 L46 53" stroke="#4C8DFF" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
      <path d="M68 60 L76 53" stroke="#FFB020" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
    </g>
  ),

  /* Fedora clássico */
  acc_hat_party: () => (
    <g stroke={INK} strokeLinejoin="round">
      <ellipse cx="60" cy="31" rx="34" ry="8" fill="#1B2545" strokeWidth="2.8" />
      <path
        d="M36 31 C36 16, 44 6, 60 6 C76 6, 84 16, 84 31 Z"
        fill="#26325A"
        strokeWidth="2.8"
      />
      <path d="M37 26 C44 21, 76 21, 83 26" fill="none" strokeWidth="2.4" opacity="0.7" />
      <path d="M36 27 H84 L83 32 H37 Z" fill="#E23B2E" strokeWidth="2.4" />
      <path d="M42 18 C48 12, 58 9, 68 10" fill="none" stroke="#EFE6D2" strokeWidth="2.4" strokeLinecap="round" opacity="0.35" />
    </g>
  ),

  /* Distintivo de chefe no peito */
  acc_crown: () => (
    <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
      <polygon
        points="84,97 86.6,102.4 92,103 88,107 89,112.4 84,109.6 79,112.4 80,107 76,103 81.4,102.4"
        fill="#FFB020"
      />
      <circle cx="84" cy="105" r="1.8" fill={INK} stroke="none" />
    </g>
  ),

  /* Gravata */
  acc_bowtie: () => (
    <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round">
      <path d="M55 96 L60 100 L65 96 L63 103 L60 101 L57 103 Z" fill="#E23B2E" strokeWidth="2.2" />
      <path d="M60 102 L64 116 L60 119 L56 116 Z" fill="#E23B2E" />
      <path d="M60 106 L63 113" stroke="#8E1F16" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
    </g>
  ),

  /* Ponto de escuta / fone de detetive */
  acc_headphones: () => (
    <g>
      <path
        d="M28 62 C26 23, 94 23, 92 62"
        fill="none"
        stroke={INK}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M28 62 C26 23, 94 23, 92 62"
        fill="none"
        stroke="#7C8AB5"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <rect x="21" y="51" width="10" height="21" rx="5" fill="#1B2545" stroke={INK} strokeWidth="2.6" />
      <rect x="89" y="51" width="10" height="21" rx="5" fill="#1B2545" stroke={INK} strokeWidth="2.6" />
      <path
        d="M88 68 C88 78, 82 82, 76 82"
        fill="none"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="75" cy="82" r="3" fill="#FFB020" stroke={INK} strokeWidth="1.8" />
    </g>
  ),

  /* Bigode de detetive */
  acc_mustache: () => (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path
        d="M60 71 C55 66.5, 46 67.5, 41 73 C47 76, 55 75, 60 72 C65 75, 73 76, 79 73 C74 67.5, 65 66.5, 60 71 Z"
        fill="#2A1D12"
      />
      <path d="M45 72 C48 70.5, 52 71, 55 72" fill="none" stroke="#6B5240" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </g>
  ),

  /* Monóculo com corrente */
  acc_flower: () => (
    <g>
      <circle
        cx="74"
        cy="58"
        r="11"
        fill="#EFE6D2"
        fillOpacity="0.16"
        stroke={INK}
        strokeWidth="3"
      />
      <circle cx="74" cy="58" r="11" fill="none" stroke="#FFB020" strokeWidth="1.4" />
      <path d="M84 64 C90 72, 86 82, 78 88" fill="none" stroke="#FFB020" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M70 53 L74 50" stroke="#EFE6D2" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </g>
  ),
};

export function Accessory({ variant }: { variant: AccessoryVariant }) {
  const renderer = ACCESSORY_VARIANTS[variant] || ACCESSORY_VARIANTS.acc_none;
  return <>{renderer()}</>;
}
