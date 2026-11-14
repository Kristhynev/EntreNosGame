import React from "react";
import { CheckCircle2, WifiOff } from "lucide-react";
import type { RoomPlayer } from "../types/game";
import { Avatar } from "./Avatar";

export interface PlayerCardProps {
  player: RoomPlayer;
  isHost: boolean;
  isMe: boolean;
  index?: number;
}

export function PlayerCard({
  player,
  isHost,
  isMe,
  index = 0,
}: PlayerCardProps) {
  const fileNumber = String(index + 1).padStart(2, "0");

  return (
    <article
      aria-label={`Ficha de ${player.nickname}${isHost ? ", detetive chefe" : ""}${
        isMe ? ", você" : ""
      }${!player.connected ? ", reconectando" : ""}`}
      style={{ animationDelay: `${index * 45}ms` }}
      className={`animate-badge-enter noir-case-card relative flex flex-col overflow-hidden rounded-[16px] border-4 border-[#0B0E1F] shadow-[0_6px_0_#05070F] transition-transform ${
        isMe ? "bg-[#F3E6C3]" : "bg-[#F6EFE0]"
      } ${!player.connected ? "opacity-70" : ""}`}
    >
      {/* Tarja de arquivo */}
      <div className="flex items-center justify-between gap-1 border-b-3 border-[#0B0E1F] bg-[#0B0E1F] px-2.5 py-1">
        <span className="font-display text-[11px] tracking-[0.18em] text-[#FFB020]">
          ARQUIVO {fileNumber}
        </span>
        <span className="text-[9px] font-black uppercase tracking-wider text-[#F6EFE0]/70">
          {player.connected ? "ATIVO" : "AUSENTE"}
        </span>
      </div>

      {/* Selo do chefe */}
      {isHost && (
        <span
          title="Detetive Chefe"
          aria-label="Detetive Chefe"
          className="absolute right-1.5 top-7 z-10 rounded-[4px] border-2 border-[#0B0E1F] bg-[#FFB020] px-1.5 py-0.5 font-display text-[11px] leading-none tracking-wide text-[#0B0E1F] shadow-[0_2px_0_#0B0E1F] rotate-3"
        >
          👑 CHEFE
        </span>
      )}

      {isMe && (
        <span className="absolute left-1.5 top-7 z-10 rounded-[4px] border-2 border-[#0B0E1F] bg-[#E23B2E] px-1.5 py-0.5 font-display text-[11px] leading-none tracking-wide text-[#F6EFE0] shadow-[0_2px_0_#0B0E1F] -rotate-3">
          VOCÊ
        </span>
      )}

      {/* Foto / avatar */}
      <div className="flex flex-1 flex-col items-center justify-start px-2.5 pb-2 pt-3.5">
        <div className="rounded-[12px] border-3 border-[#0B0E1F] bg-[#0B0E1F]/5 p-1">
          <Avatar
            avatar={player.avatar}
            size={64}
            label={`Avatar de ${player.nickname}`}
          />
        </div>

        <h3 className="mt-2 w-full truncate text-center font-display text-lg leading-tight tracking-wide text-[#0B0E1F]">
          {player.nickname}
        </h3>

        <div className="mt-1.5">
          {player.connected ? (
            <span className="inline-flex items-center gap-1 rounded-[4px] border-2 border-[#0B0E1F] bg-[#63D2B0] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0B0E1F]">
              <CheckCircle2 className="h-3 w-3 stroke-[3]" />
              Na mesa
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-[4px] border-2 border-[#0B0E1F] bg-[#FFB020] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0B0E1F]">
              <WifiOff className="h-3 w-3 stroke-[3]" />
              Reconectando
            </span>
          )}
        </div>

        {/* Código de barras decorativo */}
        <div
          aria-hidden="true"
          className="mt-2.5 flex h-3.5 w-full items-end justify-between gap-[2px] opacity-60"
        >
          {Array.from({ length: 18 }, (_, i) => (
            <span
              key={i}
              className="bg-[#0B0E1F]"
              style={{
                width: i % 3 === 0 ? "3px" : "1.5px",
                height: i % 4 === 0 ? "100%" : "70%",
              }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

export function EmptyPlayerSlot({ slotNumber }: { slotNumber: number }) {
  return (
    <div
      aria-label={`Vaga de investigador número ${slotNumber}`}
      className="slot-twinkle relative flex min-h-[182px] flex-col items-center justify-center rounded-[16px] border-3 border-dashed border-[#7C8AB5]/70 bg-[#1A2145]/60 p-3.5 text-center"
    >
      <div className="mb-1 font-display text-[11px] tracking-[0.18em] text-[#FFB020]/80">
        VAGA {String(slotNumber).padStart(2, "0")}
      </div>
      <div
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-[12px] border-2 border-dashed border-[#FFB020]/60 bg-[#0E1230]/70 font-display text-2xl text-[#FFB020]"
      >
        ?
      </div>
      <span className="mt-2 font-display text-sm tracking-wide text-[#C7D2EA]">
        Investigador ausente
      </span>
      <span className="text-[11px] font-semibold text-[#7C8AB5]">
        aguardando na delegacia...
      </span>
    </div>
  );
}
