import React, { useId } from "react";
import type { AvatarConfig } from "../types/game";
import { HairBack } from "./avatar/parts/HairBack";
import { Face } from "./avatar/parts/Face";
import { Eyes } from "./avatar/parts/Eyes";
import { Mouth } from "./avatar/parts/Mouth";
import { HairFront } from "./avatar/parts/HairFront";
import { Accessory } from "./avatar/parts/Accessory";

export interface AvatarProps {
  avatar: AvatarConfig;
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Retrato de ficha criminal: fundo azul-marinho, holofote na cor escolhida,
 * marcações de linha de suspeitos e grão de filme.
 * Camadas (ordem fixa): HairBack → Face → Eyes → Mouth → HairFront → Accessory.
 */
export function Avatar({
  avatar,
  size = 64,
  className = "",
  label = "Retrato do suspeito",
}: AvatarProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `portrait-clip-${uid}`;
  const spotId = `portrait-spot-${uid}`;
  const shadeId = `portrait-shade-${uid}`;
  const dotsId = `portrait-dots-${uid}`;

  const accent = avatar.bgColor || "#FFB020";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
      className={`select-none shrink-0 ${className}`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="4" y="4" width="112" height="112" rx="10" />
        </clipPath>

        {/* Holofote do interrogatório na cor escolhida */}
        <radialGradient id={spotId} cx="50%" cy="10%" r="82%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="42%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0E1230" stopOpacity="0" />
        </radialGradient>

        {/* Sombra lateral dura */}
        <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor="#05070F" stopOpacity="0.72" />
          <stop offset="42%" stopColor="#05070F" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#05070F" stopOpacity="0" />
        </linearGradient>

        {/* Meio-tom de impressão */}
        <pattern
          id={dotsId}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.2" cy="1.2" r="0.9" fill="#F6EFE0" opacity="0.16" />
        </pattern>
      </defs>

      {/* Fundo escuro */}
      <rect x="4" y="4" width="112" height="112" rx="10" fill="#0B0E1F" />

      <g clipPath={`url(#${clipId})`}>
        {/* Parede da sala de interrogatório com holofote */}
        <rect x="4" y="4" width="112" height="112" fill="#111634" />
        <ellipse cx="60" cy="34" rx="62" ry="70" fill={`url(#${spotId})`} />

        {/* Marcações de linha de suspeitos */}
        <g stroke={accent} strokeOpacity="0.35" strokeWidth="1.2">
          <line x1="4" y1="26" x2="116" y2="26" />
          <line x1="4" y1="94" x2="116" y2="94" />
        </g>
        <g stroke={accent} strokeOpacity="0.45" strokeWidth="1.4">
          <line x1="20" y1="90" x2="20" y2="95" />
          <line x1="40" y1="90" x2="40" y2="95" />
          <line x1="60" y1="90" x2="60" y2="95" />
          <line x1="80" y1="90" x2="80" y2="95" />
          <line x1="100" y1="90" x2="100" y2="95" />
        </g>

        {/* Silhueta nas costas: outro suspeito atrás */}
        <g opacity="0.3">
          <path
            d="M92 60 C92 44, 108 44, 108 60 L108 120 L92 120 Z"
            fill="#05070F"
          />
          <circle cx="100" cy="42" r="10" fill="#05070F" />
          <rect x="89" y="30" width="22" height="5" rx="2.5" fill="#05070F" />
        </g>

        {/* Camadas do personagem */}
        <HairBack variant={avatar.hair} hairColor={avatar.hairColor} />
        <Face variant={avatar.skin} />
        <Eyes variant={avatar.eyes} />
        <Mouth variant={avatar.mouth} />
        <HairFront variant={avatar.hair} hairColor={avatar.hairColor} />
        <Accessory variant={avatar.accessory} />

        {/* Texturas: sombra lateral, meio-tom e vinheta inferior */}
        <rect x="4" y="4" width="112" height="112" fill={`url(#${shadeId})`} />
        <rect x="4" y="4" width="112" height="112" fill={`url(#${dotsId})`} />
        <rect
          x="4"
          y="96"
          width="112"
          height="20"
          fill="#05070F"
          opacity="0.45"
        />
        <ellipse
          cx="60"
          cy="34"
          rx="58"
          ry="64"
          fill="none"
          stroke="#05070F"
          strokeWidth="22"
          opacity="0.22"
        />
      </g>

      {/* Moldura de ficha */}
      <rect
        x="4"
        y="4"
        width="112"
        height="112"
        rx="10"
        fill="none"
        stroke="#0B0E1F"
        strokeWidth="5"
      />
      <rect
        x="4"
        y="4"
        width="112"
        height="112"
        rx="10"
        fill="none"
        stroke="#F6EFE0"
        strokeOpacity="0.16"
        strokeWidth="1.4"
      />

      {/* Cantos de foto de arquivo */}
      <g stroke={accent} strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
        <path d="M12 18 L12 12 L18 12" fill="none" />
        <path d="M102 12 L108 12 L108 18" fill="none" />
        <path d="M12 102 L12 108 L18 108" fill="none" />
        <path d="M102 108 L108 108 L108 102" fill="none" />
      </g>
    </svg>
  );
}
