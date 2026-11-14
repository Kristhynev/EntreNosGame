import React, { useState } from "react";
import { Fingerprint, Search, Server, Users } from "lucide-react";
import type { AvatarConfig, ImpostorCount } from "../types/game";
import { ProfileSetup } from "./ProfileSetup";

export interface WelcomeScreenProps {
  nickname: string;
  avatar: AvatarConfig;
  connected: boolean;
  isIsolatedTab: boolean;
  standaloneServerUrl?: string;
  onChangeServerUrl?: (newUrl: string) => void;
  onNicknameChange: (nickname: string) => void;
  onOpenAvatarPicker: () => void;
  onCreateRoom: (impostors: ImpostorCount) => void;
  onJoinRoom: (roomCode: string) => void;
  onCreateTabIdentity: () => void;
}

export function WelcomeScreen({
  nickname,
  avatar,
  connected,
  isIsolatedTab,
  standaloneServerUrl,
  onChangeServerUrl,
  onNicknameChange,
  onOpenAvatarPicker,
  onCreateRoom,
  onJoinRoom,
  onCreateTabIdentity,
}: WelcomeScreenProps) {
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [initialImpostors, setInitialImpostors] = useState<ImpostorCount>(1);
  const [editingServer, setEditingServer] = useState(false);
  const [serverDraft, setServerDraft] = useState(standaloneServerUrl || "");

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = roomCodeInput.trim().toUpperCase();
    if (cleaned.length === 6) {
      onJoinRoom(cleaned);
    }
  };

  const handleServerSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = serverDraft.trim().replace(/\/$/, "");
    if (!cleaned || !onChangeServerUrl) return;
    onChangeServerUrl(cleaned);
    setEditingServer(false);
  };

  return (
    <main className="relative z-10 min-h-dvh px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Pôster / capa do caso */}
        <header className="relative overflow-hidden rounded-[26px] border-4 border-[#0B0E1F] bg-[#0A0D24] shadow-[0_10px_0_#05070F]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 p-5 sm:p-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#0B0E1F] bg-[#E23B2E] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#F6EFE0]">
                <Fingerprint className="w-3.5 h-3.5 stroke-[2.8]" />
                Caso aberto · 3 a 8 detetives
              </div>

              <h1 className="font-display text-[64px] leading-[0.86] text-[#F6EFE0] sm:text-[92px]">
                ENTRE
                <span className="ml-2 inline-block bg-[#FFB020] px-2 text-[#0B0E1F] shadow-[0_6px_0_#0B0E1F]">
                  NÓS
                </span>
              </h1>

              <p className="max-w-md text-sm sm:text-base font-semibold text-[#C7D2EA]">
                Um jogo de dedução e blefe. Todos recebem a palavra secreta do
                caso —{" "}
                <strong className="font-black text-[#FFB020]">
                  menos o impostor entre nós
                </strong>
                . Dê pistas, desconfie de todos e descubra quem está blefando
                antes que o caso esfrie.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0B0E1F] bg-[#4C8DFF] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#0B0E1F]">
                  <Search className="w-3.5 h-3.5 stroke-[3]" />
                  Palavra secreta
                </span>
                <span className="rounded-full border-2 border-[#0B0E1F] bg-[#63D2B0] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#0B0E1F]">
                  Debate por chat
                </span>
                <span className="rounded-full border-2 border-[#0B0E1F] bg-[#FF7A45] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#0B0E1F]">
                  1 a 3 impostores
                </span>
              </div>
            </div>

            {/* Arte de detetive */}
            <div className="relative min-h-[190px] lg:min-h-[260px]">
              <img
                src="/images/entre-nos-hero.jpg"
                alt="Detetive de chapéu e sobretudo investigando cartas e arquivos secretos sob um holofote laranja"
                className="absolute inset-0 h-full w-full object-cover opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D24] via-[#0A0D24]/25 to-transparent lg:bg-gradient-to-r" />
              <div className="noir-tape absolute right-4 top-4 h-6 w-24 rotate-6 rounded-[2px]" />
            </div>
          </div>
        </header>

        {/* Identidade anônima / avatar */}
        <ProfileSetup
          nickname={nickname}
          avatar={avatar}
          onNicknameChange={onNicknameChange}
          onOpenAvatarPicker={onOpenAvatarPicker}
        />

        {/* Mesa de entrada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Abrir caso */}
          <div className="noir-case-card flex flex-col justify-between gap-3.5 rounded-[24px] border-4 border-[#0B0E1F] bg-[#FFB020] p-5 text-[#0B0E1F] shadow-[0_8px_0_#05070F]">
            <div>
              <h2 className="font-display text-3xl leading-none">
                ABRIR UM CASO
              </h2>
              <p className="mt-1.5 text-sm font-bold text-[#4A3A10]">
                Você será o detetive chefe: define regras, categoria e quantos
                impostores se infiltraram.
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider">
                  🕵️ Suspeitos disfarçados
                </span>
                <div
                  role="group"
                  aria-label="Escolher quantidade inicial de impostores"
                  className="grid grid-cols-3 gap-2"
                >
                  {([1, 2, 3] as const).map((count) => {
                    const selected = initialImpostors === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setInitialImpostors(count)}
                        className={`min-h-[44px] rounded-[10px] border-[3px] border-[#0B0E1F] font-display text-lg transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E23B2E] ${
                          selected
                            ? "bg-[#0B0E1F] text-[#FFB020] shadow-[0_3px_0_#05070F]"
                            : "bg-[#F6EFE0] text-[#0B0E1F] hover:bg-[#F3E6C3]"
                        }`}
                      >
                        {count} imp.
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={!connected || !nickname.trim()}
                onClick={() => onCreateRoom(initialImpostors)}
                aria-label="Abrir um novo caso"
                className="min-h-[54px] w-full rounded-[12px] border-[3px] border-[#0B0E1F] bg-[#0B0E1F] px-5 font-display text-2xl tracking-wide text-[#FFB020] shadow-[0_5px_0_#000] transition-all hover:bg-[#1A2145] active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E23B2E]"
              >
                🔎 ABRIR O CASO
              </button>
            </div>
          </div>

          {/* Entrar em caso existente */}
          <form
            onSubmit={handleJoinSubmit}
            className="noir-case-card flex flex-col justify-between gap-3 rounded-[24px] border-4 border-[#0B0E1F] bg-[#4C8DFF] p-5 text-[#0B0E1F] shadow-[0_8px_0_#05070F]"
          >
            <div>
              <h2 className="font-display text-3xl leading-none">
                JÁ TEM UM CASO?
              </h2>
              <p className="mt-1.5 text-sm font-bold text-[#1B3A63]">
                Digite o código de 6 caracteres do seu convite para entrar na
                mesa de investigação.
              </p>
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                maxLength={6}
                value={roomCodeInput}
                onChange={(e) =>
                  setRoomCodeInput(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                  )
                }
                placeholder="EX: CASO07"
                aria-label="Código do caso com 6 caracteres"
                className="min-h-[50px] w-full rounded-[10px] border-[3px] border-[#0B0E1F] bg-[#F6EFE0] px-4 text-center font-display text-2xl uppercase tracking-[0.22em] text-[#0B0E1F] focus:outline-none focus:ring-4 focus:ring-[#FFB020]"
              />

              <button
                type="submit"
                disabled={
                  !connected ||
                  roomCodeInput.trim().length !== 6 ||
                  !nickname.trim()
                }
                aria-label="Entrar no caso com código"
                className="min-h-[54px] w-full rounded-[12px] border-[3px] border-[#0B0E1F] bg-[#0B0E1F] px-5 font-display text-2xl tracking-wide text-[#F6EFE0] shadow-[0_5px_0_#000] transition-all hover:bg-[#1A2145] active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
              >
                🗂️ ENTRAR NO CASO
              </button>
            </div>
          </form>
        </div>

        {/* Dossiê rápido */}
        <section
          aria-label="Como funciona o jogo"
          className="grid grid-cols-1 gap-3 text-[#0B0E1F] sm:grid-cols-3"
        >
          {[
            {
              step: "01",
              title: "A PALAVRA SECRETA",
              text: "Os inocentes recebem a palavra do caso. O impostor recebe apenas a categoria.",
            },
            {
              step: "02",
              title: "PISTAS & DEBATE",
              text: "Cada um dá uma pista curta e a mesa abre o debate por chat (opcional).",
            },
            {
              step: "03",
              title: "VOTAÇÃO & SENSAÇÃO",
              text: "Elimine um suspeito. Se era impostor, ele tem 20s para adivinhar a palavra.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[18px] border-3 border-[#0B0E1F] bg-[#F6EFE0] p-3.5 shadow-[0_4px_0_#05070F]"
            >
              <div className="flex items-center gap-2">
                <span className="font-display text-xl text-[#E23B2E]">
                  {item.step}
                </span>
                <span className="font-display text-base tracking-wide text-[#0B0E1F]">
                  {item.title}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-snug text-[#48526B]">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        {/* Configuração de servidor (Firebase Hosting standalone) */}
        {editingServer && onChangeServerUrl && (
          <form
            onSubmit={handleServerSave}
            className="animate-pop-in space-y-2.5 rounded-[18px] border-3 border-[#0B0E1F] bg-[#1A2145] p-4 shadow-[0_5px_0_#05070F]"
          >
            <label
              htmlFor="socket-server-url-input"
              className="block font-display text-lg tracking-wide text-[#FFB020]"
            >
              🔌 URL DO SERVIDOR SOCKET.IO
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="socket-server-url-input"
                type="url"
                required
                value={serverDraft}
                onChange={(e) => setServerDraft(e.target.value)}
                placeholder="https://entre-nos-server-xyz.run.app"
                className="min-h-[46px] flex-1 rounded-[10px] border-3 border-[#0B0E1F] bg-[#F6EFE0] px-3.5 text-sm font-semibold text-[#0B0E1F] focus:outline-none focus:ring-4 focus:ring-[#FFB020]"
              />
              <button
                type="submit"
                className="min-h-[46px] rounded-[10px] border-3 border-[#0B0E1F] bg-[#FFB020] px-5 font-display text-lg text-[#0B0E1F] shadow-[0_3px_0_#05070F]"
              >
                Conectar
              </button>
            </div>
          </form>
        )}

        {/* Rodapé da mesa */}
        <footer className="flex flex-col items-center justify-between gap-2 pt-1 text-xs font-bold text-[#9FB0D0] sm:flex-row">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-3 w-3 rounded-full border-2 border-[#0B0E1F] ${
                connected ? "bg-[#63D2B0]" : "animate-pulse bg-[#E23B2E]"
              }`}
            />
            <span>
              {connected
                ? "Mesa conectada em tempo real"
                : "Conectando à mesa de investigação..."}
            </span>
            {!connected && onChangeServerUrl && (
              <button
                type="button"
                onClick={() => setEditingServer((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full border-2 border-[#0B0E1F] bg-[#FFB020] px-2.5 py-0.5 font-black text-[#0B0E1F] hover:brightness-105"
              >
                <Server className="h-3 w-3" />
                <span>Configurar Servidor</span>
              </button>
            )}
          </div>

          {isIsolatedTab ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#63D2B0] bg-[#1A2145] px-3 py-1 text-[#63D2B0]">
              <Users className="h-3.5 w-3.5" />
              Modo multi-aba ativo nesta aba
            </span>
          ) : (
            <button
              type="button"
              onClick={onCreateTabIdentity}
              aria-label="Criar identidade separada nesta aba para testar multiplayer"
              className="rounded-lg px-2 py-1 underline decoration-dotted hover:text-[#FFB020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB020]"
            >
              Testando em várias abas? Criar jogador separado nesta aba
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}
