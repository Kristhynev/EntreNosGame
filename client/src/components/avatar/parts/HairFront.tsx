import React from "react";
import type { HairColorVariant, HairVariant } from "../../../types/game";
import { HAIR_COLOR_PALETTES } from "../../../lib/identity";

const INK = "#0B0E1F";

interface HairPalette {
  base: string;
  dark: string;
  highlight: string;
}

export const HAIR_FRONT_VARIANTS: Record<
  HairVariant,
  (c: HairPalette) => React.ReactNode
> = {
  /* Corte curto com risca lateral */
  hair_short: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M31 50 C30 27, 50 21, 66 23 C83 25, 90 36, 89 50 C83 41, 74 38, 64 41 C53 44, 42 39, 31 50 Z"
        fill={c.base}
      />
      <path
        d="M63 24 C68 31, 70 38, 69 45"
        fill="none"
        stroke={c.dark}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M42 31 Q54 25 66 28"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.75"
      />
    </g>
  ),

  hair_curly: (c) => (
    <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round">
      <circle cx="38" cy="37" r="9" fill={c.base} />
      <circle cx="52" cy="33" r="10" fill={c.base} />
      <circle cx="68" cy="33" r="10" fill={c.base} />
      <circle cx="82" cy="37" r="9" fill={c.base} />
      <circle cx="60" cy="30" r="9.5" fill={c.base} />
      <path
        d="M49 29 Q53 26 57 29 M65 29 Q69 26 73 29"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />
    </g>
  ),

  /* Risca ao meio com ondas */
  hair_long: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path d="M31 52 C31 27, 52 22, 60 25 C56 36, 43 43, 31 52 Z" fill={c.base} />
      <path d="M89 52 C89 27, 68 22, 60 25 C64 36, 77 43, 89 52 Z" fill={c.base} />
      <path
        d="M39 35 Q47 29 55 31"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M81 35 Q73 29 65 31"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.45"
      />
    </g>
  ),

  hair_bun: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M32 49 C33 28, 48 25, 60 25 C72 25, 87 28, 88 49 C80 38, 69 35, 60 38 C51 35, 40 38, 32 49 Z"
        fill={c.base}
      />
      <path
        d="M44 32 Q60 27 76 32"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M60 25 L60 38"
        stroke={c.dark}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  ),

  hair_mohawk: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M52 40 L48 22 L57 26 L60 10 L65 25 L73 20 L68 40 Q60 35 52 40 Z"
        fill={c.base}
      />
      <path
        d="M58 18 L60 33"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
  ),

  hair_afro: (c) => (
    <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round">
      <path
        d="M32 45 Q40 35 50 38 Q60 32 70 38 Q80 35 88 45 C87 32, 74 25, 60 25 C46 25, 33 32, 32 45 Z"
        fill={c.base}
      />
      <path
        d="M44 34 Q52 29 60 31"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  ),

  hair_ponytail: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M31 50 C31 27, 52 23, 72 26 C84 28, 89 37, 89 48 C79 38, 62 36, 47 42 C40 45, 35 47, 31 50 Z"
        fill={c.base}
      />
      <path
        d="M44 32 Q60 27 76 33"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M40 45 C55 38, 72 38, 84 44"
        fill="none"
        stroke={c.dark}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </g>
  ),

  hair_bald: () => (
    <g>
      <path
        d="M44 39 Q50 34 58 35"
        fill="none"
        stroke="#EFE6D2"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
      <circle cx="63" cy="35.5" r="1.5" fill="#EFE6D2" opacity="0.4" />
    </g>
  ),

  hair_spiky: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M31 48 L28 31 L42 36 L45 18 L57 31 L64 15 L71 31 L84 21 L82 37 L92 33 L89 48 C78 40, 68 41, 60 43 C50 40, 40 41, 31 48 Z"
        fill={c.base}
      />
      <path
        d="M47 25 L52 35 M64 21 L66 34"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>
  ),

  /* Gomalina penteada para trás */
  hair_wavy: (c) => (
    <g stroke={INK} strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M31 51 C30 27, 52 21, 70 24 C84 26, 90 36, 89 50 C82 44, 76 36, 65 40 C54 44, 44 37, 31 51 Z"
        fill={c.base}
      />
      <path
        d="M40 33 C50 27, 62 33, 76 29"
        fill="none"
        stroke={c.highlight}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M46 42 C56 37, 68 41, 80 37"
        fill="none"
        stroke={c.dark}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </g>
  ),
};

export function HairFront({
  variant,
  hairColor,
}: {
  variant: HairVariant;
  hairColor: HairColorVariant;
}) {
  const palette = HAIR_COLOR_PALETTES[hairColor] || HAIR_COLOR_PALETTES.hair_brown;
  const renderer = HAIR_FRONT_VARIANTS[variant] || HAIR_FRONT_VARIANTS.hair_short;
  return <>{renderer(palette)}</>;
}
