import React, { useEffect, useState } from "react";
import { Check, Dices, Save, X } from "lucide-react";
import type { AvatarConfig } from "../types/game";
import {
  ACCESSORY_LABELS,
  AVATAR_CATALOG,
  BG_LABELS,
  EYES_LABELS,
  generateRandomAvatar,
  HAIR_COLOR_PALETTES,
  HAIR_LABELS,
  MOUTH_LABELS,
  SKIN_PALETTES,
} from "../lib/identity";
import { Avatar } from "./Avatar";

type PickerTab = "skin" | "hair" | "eyes" | "mouth" | "accessory" | "bgColor";

const TABS: { id: PickerTab; label: string; file: string }[] = [
  { id: "skin", label: "Rosto", file: "A" },
  { id: "hair", label: "Cabelo", file: "B" },
  { id: "eyes", label: "Olhos", file: "C" },
  { id: "mouth", label: "Boca", file: "D" },
  { id: "accessory", label: "Acessório", file: "E" },
  { id: "bgColor", label: "Holofote", file: "F" },
];

export interface AvatarPickerProps {
  isOpen: boolean;
  initialAvatar: AvatarConfig;
  initialNickname?: string;
  allowNicknameEdit?: boolean;
  onClose: () => void;
  onSave: (avatar: AvatarConfig, nickname?: string) => void;
}

export function AvatarPicker({
  isOpen,
  initialAvatar,
  initialNickname = "",
  allowNicknameEdit = false,
  onClose,
  onSave,
}: AvatarPickerProps) {
  const [draft, setDraft] = useState<AvatarConfig>(initialAvatar);
  const [nickname, setNickname] = useState<string>(initialNickname);
  const [activeTab, setActiveTab] = useState<PickerTab>("skin");

  useEffect(() => {
    if (isOpen) {
      setDraft(initialAvatar);
      setNickname(initialNickname);
    }
  }, [isOpen, initialAvatar, initialNickname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRandomize = () => setDraft(generateRandomAvatar());

  const handleSave = () => {
    const cleanNick = nickname.trim().slice(0, 15);
    onSave(draft, allowNicknameEdit ? cleanNick || initialNickname : undefined);
    onClose();
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-[#05070F]/85 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-picker-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-pop-in flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[18px] border-t-4 border-[#0B0E1F] bg-[#0B0E1F] shadow-[0_12px_0_#05070F] sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-[18px] sm:border-4">
        {/* Cabeçalho do arquivo + prancha do suspeito */}
        <div className="shrink-0 border-b-4 border-[#05070F] bg-[#0A0D24] px-4 pb-3 pt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <span className="font-display text-[10px] tracking-[0.22em] text-[#FFB020]">
                ARQUIVO DE SUSPEITOS · PRANCHA {TABS.find((t) => t.id === activeTab)?.file}
              </span>
              <h2
                id="avatar-picker-title"
                className="font-display text-2xl leading-none text-[#F6EFE0] sm:text-3xl"
              >
                🔎 SALA DE IDENTIFICAÇÃO
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar sala de identificação"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border-3 border-[#05070F] bg-[#E23B2E] text-[#F6EFE0] shadow-[0_4px_0_#05070F] transition-all hover:brightness-110 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
            >
              <X className="h-5 w-5 stroke-[3]" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* Retrato 120px com moldura de ficha */}
            <div className="relative shrink-0">
              <div className="rounded-[12px] border-3 border-[#FFB020] bg-[#05070F] p-1 shadow-[0_5px_0_#05070F]">
                <Avatar
                  avatar={draft}
                  size={120}
                  label="Retrato do suspeito em edição"
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rotate-[-3deg] rounded-[2px] border border-[#0B0E1F] bg-[#FFB020] px-2 py-0.5 font-display text-[10px] tracking-[0.16em] text-[#0B0E1F]">
                FOTO 01
              </span>
            </div>

            <div className="flex w-full flex-1 flex-col items-center gap-2.5 sm:items-start">
              {allowNicknameEdit && (
                <div className="w-full max-w-xs">
                  <label
                    htmlFor="picker-nickname-input"
                    className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-[#FFB020]"
                  >
                    Nome de código no caso (máx. 15)
                  </label>
                  <input
                    id="picker-nickname-input"
                    type="text"
                    maxLength={15}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 15))}
                    placeholder="Ex: DetetiveRaposa42"
                    className="min-h-[46px] w-full rounded-[8px] border-3 border-[#05070F] bg-[#F6EFE0] px-3.5 font-bold text-[#0B0E1F] focus:outline-none focus:ring-4 focus:ring-[#4C8DFF]"
                  />
                </div>
              )}

              <div className="flex w-full flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <button
                  type="button"
                  onClick={handleRandomize}
                  aria-label="Sortear todas as características do suspeito"
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-[8px] border-3 border-[#05070F] bg-[#4C8DFF] px-4 font-display text-lg tracking-wide text-[#0B0E1F] shadow-[0_4px_0_#05070F] transition-all hover:brightness-105 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
                >
                  <Dices className="h-4 w-4 stroke-[2.8]" />
                  ALEATÓRIO
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  aria-label="Salvar o retrato do suspeito"
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-[8px] border-3 border-[#05070F] bg-[#FFB020] px-5 font-display text-lg tracking-wide text-[#0B0E1F] shadow-[0_4px_0_#05070F] transition-all hover:brightness-105 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E23B2E]"
                >
                  <Save className="h-4 w-4 stroke-[2.8]" />
                  SELAR FICHA
                </button>
              </div>
            </div>
          </div>

          {/* Abas do arquivo */}
          <div
            role="tablist"
            aria-label="Categorias da ficha do suspeito"
            className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-1"
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] whitespace-nowrap rounded-t-[8px] border-3 border-b-0 border-[#05070F] px-3.5 font-display text-sm tracking-wide transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020] ${
                    isSelected
                      ? "bg-[#F6EFE0] text-[#0B0E1F]"
                      : "bg-[#1A2145] text-[#C7D2EA] hover:bg-[#2A3566]"
                  }`}
                >
                  <span className="mr-1 text-[10px] opacity-60">{tab.file}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prancha de opções */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-[#F6EFE0] p-4 text-[#0B0E1F] sm:p-5">
          {activeTab === "skin" && (
            <OptionGrid
              title="Tom de pele do suspeito"
              options={AVATAR_CATALOG.skin.map((skin) => ({
                id: skin,
                label: SKIN_PALETTES[skin].label,
                selected: draft.skin === skin,
                previewAvatar: { ...draft, skin },
                onSelect: () => setDraft((prev) => ({ ...prev, skin })),
              }))}
            />
          )}

          {activeTab === "hair" && (
            <div className="space-y-5">
              <OptionGrid
                title="Corte de cabelo"
                options={AVATAR_CATALOG.hair.map((hair) => ({
                  id: hair,
                  label: HAIR_LABELS[hair],
                  selected: draft.hair === hair,
                  previewAvatar: { ...draft, hair },
                  onSelect: () => setDraft((prev) => ({ ...prev, hair })),
                }))}
              />
              <OptionGrid
                title="Cor do cabelo"
                options={AVATAR_CATALOG.hairColor.map((hairColor) => ({
                  id: hairColor,
                  label: HAIR_COLOR_PALETTES[hairColor].label,
                  selected: draft.hairColor === hairColor,
                  previewAvatar: {
                    ...draft,
                    hair: draft.hair === "hair_bald" ? "hair_short" : draft.hair,
                    hairColor,
                  },
                  onSelect: () => setDraft((prev) => ({ ...prev, hairColor })),
                }))}
              />
            </div>
          )}

          {activeTab === "eyes" && (
            <OptionGrid
              title="Olhar do suspeito"
              options={AVATAR_CATALOG.eyes.map((eyes) => ({
                id: eyes,
                label: EYES_LABELS[eyes],
                selected: draft.eyes === eyes,
                previewAvatar: { ...draft, eyes },
                onSelect: () => setDraft((prev) => ({ ...prev, eyes })),
              }))}
            />
          )}

          {activeTab === "mouth" && (
            <OptionGrid
              title="Expressão da boca"
              options={AVATAR_CATALOG.mouth.map((mouth) => ({
                id: mouth,
                label: MOUTH_LABELS[mouth],
                selected: draft.mouth === mouth,
                previewAvatar: { ...draft, mouth },
                onSelect: () => setDraft((prev) => ({ ...prev, mouth })),
              }))}
            />
          )}

          {activeTab === "accessory" && (
            <OptionGrid
              title="Acessório de investigação"
              options={AVATAR_CATALOG.accessory.map((accessory) => ({
                id: accessory,
                label: ACCESSORY_LABELS[accessory],
                selected: draft.accessory === accessory,
                previewAvatar: { ...draft, accessory },
                onSelect: () => setDraft((prev) => ({ ...prev, accessory })),
              }))}
            />
          )}

          {activeTab === "bgColor" && (
            <OptionGrid
              title="Cor do holofote do retrato"
              options={AVATAR_CATALOG.bgColor.map((bgColor) => ({
                id: bgColor,
                label: BG_LABELS[bgColor],
                selected: draft.bgColor === bgColor,
                previewAvatar: { ...draft, bgColor },
                onSelect: () => setDraft((prev) => ({ ...prev, bgColor })),
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface OptionItem {
  id: string;
  label: string;
  selected: boolean;
  previewAvatar: AvatarConfig;
  onSelect: () => void;
}

function OptionGrid({ title, options }: { title: string; options: OptionItem[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-display text-base tracking-wide text-[#0B0E1F]">
          {title}
        </span>
        <span className="h-[2px] flex-1 bg-[#0B0E1F]/25" />
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onSelect}
            aria-pressed={item.selected}
            aria-label={`${title}: ${item.label}${
              item.selected ? " (selecionado)" : ""
            }`}
            className={`relative flex min-h-[108px] flex-col items-center justify-center rounded-[8px] border-3 p-2 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E23B2E] ${
              item.selected
                ? "-translate-y-0.5 border-[#0B0E1F] bg-[#FFB020] shadow-[0_4px_0_#0B0E1F]"
                : "border-[#0B0E1F]/70 bg-[#F2E8D2] shadow-[0_3px_0_#0B0E1F]/60 hover:bg-[#F7EDD3] active:translate-y-0.5 active:shadow-none"
            }`}
          >
            {item.selected && (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-[3px] border-2 border-[#0B0E1F] bg-[#0B0E1F] text-[#FFB020]"
              >
                <Check className="h-3 w-3 stroke-[3.5]" />
              </span>
            )}

            <Avatar
              avatar={item.previewAvatar}
              size={58}
              label={`Miniatura ${item.label}`}
            />
            <span className="mt-1.5 text-center text-[11px] font-extrabold leading-tight text-[#0B0E1F]">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
