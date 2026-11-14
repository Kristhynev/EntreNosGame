import React from "react";
import { RefreshCw } from "lucide-react";
import type { AvatarConfig } from "../types/game";
import { generateFunNickname } from "../lib/identity";
import { Avatar } from "./Avatar";

export interface ProfileSetupProps {
  nickname: string;
  avatar: AvatarConfig;
  onNicknameChange: (nickname: string) => void;
  onOpenAvatarPicker: () => void;
}

export function ProfileSetup({
  nickname,
  avatar,
  onNicknameChange,
  onOpenAvatarPicker,
}: ProfileSetupProps) {
  const handleShuffleNick = () => {
    onNicknameChange(generateFunNickname());
  };

  return (
    <div className="noir-case-card overflow-hidden rounded-[18px] border-4 border-[#0B0E1F] bg-[#F6EFE0] text-[#0B0E1F] shadow-[0_8px_0_#05070F]">
      {/* Cabeçalho de arquivo confidencial */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-3 border-[#0B0E1F] bg-[#0B0E1F] px-4 py-2">
        <span className="font-display text-base tracking-[0.16em] text-[#FFB020]">
          FICHA DE IDENTIFICAÇÃO · CONFIDENCIAL
        </span>
        <span className="rounded-[3px] border border-[#FFB020] bg-[#E23B2E] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#F6EFE0]">
          Sem cadastro
        </span>
      </div>

      <div className="flex flex-col items-center gap-5 p-4 sm:flex-row sm:p-5">
        {/* Retrato do investigador */}
        <div className="flex shrink-0 flex-col items-center gap-2.5">
          <div className="relative">
            <span className="absolute -left-2 -top-2 z-10 rotate-[-8deg] rounded-[3px] border-2 border-[#0B0E1F] bg-[#E23B2E] px-1.5 py-0.5 font-display text-[10px] tracking-[0.16em] text-[#F6EFE0]">
              RETRATO
            </span>
            <button
              type="button"
              onClick={onOpenAvatarPicker}
              aria-label="Abrir o editor de disfarce do detetive"
              className="relative rounded-[12px] border-3 border-[#0B0E1F] bg-[#FFB020] p-1 shadow-[0_5px_0_#0B0E1F] transition-all hover:brightness-105 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4C8DFF]"
            >
              <Avatar avatar={avatar} size={104} label="Seu avatar atual" />
            </button>
            <div className="noir-tape absolute -bottom-2 left-1/2 h-4 w-16 -translate-x-1/2 -rotate-2 rounded-[1px]" />
          </div>

          <button
            type="button"
            onClick={onOpenAvatarPicker}
            aria-label="Personalizar peças do seu avatar"
            className="mt-1 min-h-[46px] rounded-[8px] border-3 border-[#0B0E1F] bg-[#FF7A45] px-4 font-display text-lg tracking-wide text-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] transition-all hover:brightness-105 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4C8DFF]"
          >
            ✏️ EDITAR DISFARCE
          </button>
        </div>

        {/* Dados do investigador */}
        <div className="w-full flex-1 space-y-3">
          <div>
            <div className="mb-1.5 flex items-end justify-between gap-2">
              <label
                htmlFor="welcome-nickname-input"
                className="font-display text-xl leading-none tracking-wide text-[#0B0E1F]"
              >
                NOME DE CÓDIGO DO DETETIVE
              </label>
              <span className="rounded-[3px] border-2 border-[#0B0E1F] bg-[#0B0E1F] px-2 py-0.5 font-display text-xs tracking-wider text-[#FFB020]">
                {nickname.length}/15
              </span>
            </div>

            <div className="flex gap-2">
              <input
                id="welcome-nickname-input"
                type="text"
                maxLength={15}
                value={nickname}
                onChange={(e) => onNicknameChange(e.target.value.slice(0, 15))}
                placeholder="Ex: DetetiveRaposa42"
                aria-label="Seu nome de código (máximo 15 caracteres)"
                className="min-h-[52px] flex-1 rounded-[8px] border-3 border-[#0B0E1F] bg-[#F2E8D2] px-4 text-lg font-extrabold text-[#0B0E1F] focus:outline-none focus:ring-4 focus:ring-[#4C8DFF]"
              />

              <button
                type="button"
                onClick={handleShuffleNick}
                aria-label="Gerar outro nome de código aleatório"
                title="Sortear nome de código"
                className="inline-flex min-h-[52px] min-w-[52px] items-center justify-center rounded-[8px] border-3 border-[#0B0E1F] bg-[#4C8DFF] text-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] transition-all hover:brightness-105 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
              >
                <RefreshCw className="h-5 w-5 stroke-[2.8]" />
              </button>
            </div>
          </div>

          {/* Linhas de dossiê */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wider text-[#5A6785]">
            <div className="rounded-[4px] border-2 border-dashed border-[#0B0E1F]/30 px-2 py-1">
              ID do caso: automático
            </div>
            <div className="rounded-[4px] border-2 border-dashed border-[#0B0E1F]/30 px-2 py-1">
              Arquivo: local
            </div>
          </div>

          <p className="text-xs font-semibold text-[#5A6785]">
            Nenhum cadastro: seu nome de código, ficha e disfarce ficam salvos
            apenas neste dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
}
