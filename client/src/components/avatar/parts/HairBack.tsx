import React from "react";
import type { HairColorVariant, HairVariant } from "../../../types/game";
import { HAIR_COLOR_PALETTES } from "../../../lib/identity";

const INK = "#0B0E1F";

interface HairPalette {
  base: string;
  dark: string;
  highlight: string;
}

export const HAIR_BACK_VARIANTS: Record<
  HairVariant,
  (c: HairPalette) => React.ReactNode
> = {
  hair_short: () => null,
  hair_bald: () => null,
  hair_mohawk: () => null,
  hair_spiky: () => null,

  hair_curly: (c) => (
    <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round">
      <circle cx="33" cy="50" r="12" fill={c.dark} />
      <circle cx="87" cy="50" r="12" fill={c.dark} />
      <circle cx="29" cy="66" r="10.5" fill={c.base} />
      <circle cx="91" cy="66" r="10.5" fill={c.base} />
      <circle cx="34" cy="80" r="9" fill={c.dark} />
      <circle cx="86" cy="80" r="9" fill={c.dark} />
    </g>
  ),

  /* Ondas de femme fatale caindo sobre o sobretudo */
  hair_long: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M28 46 C20 68, 20 92, 26 108 C34 114, 46 111, 48 102 L50 58 Z"
        fill={c.dark}
      />
      <path
        d="M92 46 C100 68, 100 92, 94 108 C86 114, 74 111, 72 102 L70 58 Z"
        fill={c.dark}
      />
      <path
        d="M30 44 C30 22, 90 22, 90 44 L94 96 C94 106, 82 110, 76 104 L44 104 C38 110, 26 106, 26 96 Z"
        fill={c.base}
      />
      <path
        d="M34 60 C31 78, 33 92, 36 100"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </g>
  ),

  hair_bun: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <circle cx="60" cy="18" r="13" fill={c.base} />
      <path
        d="M54 13 Q60 9 67 14"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect x="48" y="26" width="24" height="6" rx="3" fill="#E4DCC6" stroke={INK} strokeWidth="2.2" />
    </g>
  ),

  hair_afro: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <circle cx="60" cy="50" r="39" fill={c.base} />
      <circle cx="29" cy="41" r="14" fill={c.base} stroke="none" />
      <circle cx="91" cy="41" r="14" fill={c.base} stroke="none" />
      <path
        d="M36 26 Q48 17 62 21"
        fill="none"
        stroke={c.highlight}
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>
  ),

  hair_ponytail: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M83 40 C99 34, 111 50, 105 70 C102 81, 94 86, 88 82 C91 72, 89 58, 81 51 Z"
        fill={c.base}
      />
      <path
        d="M89 45 C99 46, 102 58, 98 68"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="83" cy="43" r="5" fill={c.dark} />
    </g>
  ),

  hair_wavy: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M29 44 C19 58, 31 70, 23 84 C19 95, 27 106, 39 105 L47 86 L45 44 Z"
        fill={c.base}
      />
      <path
        d="M91 44 C101 58, 89 70, 97 84 C101 95, 93 106, 81 105 L73 86 L75 44 Z"
        fill={c.base}
      />
      <path
        d="M34 56 C30 68, 36 76, 32 88"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </g>
  ),
};

export function HairBack({
  variant,
  hairColor,
}: {
  variant: HairVariant;
  hairColor: HairColorVariant;
}) {
  const palette = HAIR_COLOR_PALETTES[hairColor] || HAIR_COLOR_PALETTES.hair_brown;
  const renderer = HAIR_BACK_VARIANTS[variant] || HAIR_BACK_VARIANTS.hair_short;
  return <>{renderer(palette)}</>;
}
