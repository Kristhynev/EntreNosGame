import React, { useId } from "react";
import type { SkinVariant } from "../../../types/game";
import { SKIN_PALETTES } from "../../../lib/identity";

const INK = "#0B0E1F";

function renderFaceWithSkin(skin: SkinVariant) {
  const palette = SKIN_PALETTES[skin] || SKIN_PALETTES.skin_02;

  return (
    <>
      {/* Sobretudo do detetive */}
      <path
        d="M20 120 C22 100, 37 92, 60 92 C83 92, 98 100, 100 120 Z"
        fill="#222B4C"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Camisa */}
      <path
        d="M50 94 L60 113 L70 94 Z"
        fill="#E4DCC6"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Lapelas */}
      <path
        d="M50 94 L34 120 L47 120 L57 100 Z"
        fill="#2E3A63"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M70 94 L86 120 L73 120 L63 100 Z"
        fill="#2E3A63"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Gola alta do sobretudo */}
      <path
        d="M40 96 C46 90, 52 89, 60 89 C68 89, 74 90, 80 96"
        fill="none"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Pescoço */}
      <rect
        x="51"
        y="80"
        width="18"
        height="17"
        rx="7"
        fill={palette.base}
        stroke={INK}
        strokeWidth="3"
      />
      <path d="M52 87 Q60 93 68 87" fill={palette.shadow} opacity="0.8" />

      {/* Orelhas */}
      <circle
        cx="31"
        cy="63"
        r="7.5"
        fill={palette.base}
        stroke={INK}
        strokeWidth="3"
      />
      <circle cx="32" cy="63" r="2.8" fill={palette.shadow} />
      <circle
        cx="89"
        cy="63"
        r="7.5"
        fill={palette.base}
        stroke={INK}
        strokeWidth="3"
      />
      <circle cx="88" cy="63" r="2.8" fill={palette.shadow} />

      {/* Cabeça */}
      <rect
        x="32"
        y="32"
        width="56"
        height="59"
        rx="25"
        fill={palette.base}
        stroke={INK}
        strokeWidth="3.2"
      />

      {/* Sombra lateral (claro-escuro de holofote) */}
      <ellipse
        cx="80"
        cy="62"
        rx="9"
        ry="25"
        fill={palette.shadow}
        opacity="0.38"
      />
      {/* Maçãs do rosto marcadas */}
      <path
        d="M39 70 Q43 73 47 71"
        fill="none"
        stroke={palette.shadow}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M73 71 Q77 73 81 70"
        fill="none"
        stroke={palette.shadow}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Nariz */}
      <path
        d="M58.5 60 Q62 65 58.5 68.5"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Linha do maxilar */}
      <path
        d="M45 83 Q60 88 75 83"
        fill="none"
        stroke={palette.shadow}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Barba por fazer nos tons mais escuros */}
      {(skin === "skin_04" || skin === "skin_05" || skin === "skin_06") && (
        <g fill={palette.shadow} opacity="0.45">
          <circle cx="49" cy="80" r="1" />
          <circle cx="54" cy="83" r="1" />
          <circle cx="60" cy="84.5" r="1" />
          <circle cx="66" cy="83" r="1" />
          <circle cx="71" cy="80" r="1" />
          <circle cx="43" cy="76" r="1" />
          <circle cx="77" cy="76" r="1" />
        </g>
      )}
    </>
  );
}

export const FACE_VARIANTS: Record<SkinVariant, () => React.ReactNode> = {
  skin_01: () => renderFaceWithSkin("skin_01"),
  skin_02: () => renderFaceWithSkin("skin_02"),
  skin_03: () => renderFaceWithSkin("skin_03"),
  skin_04: () => renderFaceWithSkin("skin_04"),
  skin_05: () => renderFaceWithSkin("skin_05"),
  skin_06: () => renderFaceWithSkin("skin_06"),
};

export function Face({ variant }: { variant: SkinVariant }) {
  const renderer = FACE_VARIANTS[variant] || FACE_VARIANTS.skin_02;
  return <>{renderer()}</>;
}

export function useFaceMaskId() {
  const raw = useId();
  return `face-mask-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
