import React, { useState } from "react";
import {
  Check,
  Clock,
  Copy,
  LogOut,
  MessageSquare,
  MessageSquareOff,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { RoomSettings, RoomState, WordCategory } from "../types/game";
import { EmptyPlayerSlot, PlayerCard } from "./PlayerCard";

const CATEGORIES: WordCategory[] = [
  "Comida",
  "Lugares",
  "Animais",
  "Filmes",
  "Aleatório",
];

const TIME_OPTIONS: Array<30 | 45 | 60> = [30, 45, 60];
const DEBATE_TIME_OPTIONS: Array<30 | 45 | 60 | 90> = [30, 45, 60, 90];

export interface LobbyProps {
  room: RoomState;
  myPlayerId: string;
  onOpenAvatarPicker: () => void;
  onUpdateSettings: (partial: Partial<RoomSettings>) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function Lobby({
  room,
  myPlayerId,
  onOpenAvatarPicker,
  onUpdateSettings,
  onStartGame,
  onLeaveRoom,
}: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isHost = room.hostId === myPlayerId;
  const connectedCount = room.players.filter((p) => p.connected).length;
  const minPlayersRequired = Math.max(3, room.settings.impostors + 1);
  const missingPlayers = Math.max(0, minPlayersRequired - connectedCount);
  const emptySlotsCount = Math.max(0, 8 - room.players.length);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const hostButtonLabel =
    missingPlayers === 1
      ? connectedCount >= 3 && room.settings.impostors === 3
        ? "Precisamos de mais 1 pessoa para 3 Impostores! 🕵️"
        : "Precisamos de mais 1 pessoa! 🕵️"
      : missingPlayers > 1
        ? `Precisamos de mais ${missingPlayers} pessoas! 🕵️`
        : "🔎 INICIAR INVESTIGAÇÃO";

  return (
    <div className="relative z-10 min-h-dvh flex flex-col pb-8">
      {/* Header Fixo estilo Caso */}
      <header className="sticky top-0 z-30 bg-[#0A0D24]/95 backdrop-blur-md border-b-4 border-[#0B0E1F] px-3 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide drop-shadow-[0_3px_0_#0B0E1F]">
              🕵️ ENTRE <span className="text-[#FFB020]">NÓS</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ticket recortado com código da sala + botão copiar */}
            <div className="party-ticket flex items-center bg-[#FFB020] text-[#0B0E1F] rounded-[20px] border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] px-3 py-1.5 gap-2.5">
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A4210]">
                  CÓDIGO DO CASO
                </span>
                <span className="font-display font-bold text-lg sm:text-xl tracking-[0.18em]">
                  {room.roomCode}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                aria-label={`Copiar código da sala ${room.roomCode}`}
                className="min-h-[40px] px-3 rounded-xl bg-[#F6EFE0] text-[#0B0E1F] font-display font-bold text-xs inline-flex items-center gap-1.5 border-2 border-[#0B0E1F] hover:bg-[#63D2B0] active:translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 stroke-[2.6]" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onLeaveRoom}
              aria-label="Sair da sala atual"
              title="Sair da sala"
              className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-[18px] bg-[#E23B2E] text-white border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
            >
              <LogOut className="w-5 h-5 stroke-[2.8]" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Lobby */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Banner da mesa de investigação */}
        <section className="relative overflow-hidden rounded-[18px] border-4 border-[#0B0E1F] bg-[#0A0D24] shadow-[0_8px_0_#05070F]">
          <img
            src="/images/entre-nos-hero.jpg"
            alt="Detetive investigando cartas e arquivos sob o holofote"
            className="absolute inset-0 h-full w-full object-cover object-right opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D24] via-[#0A0D24]/85 to-transparent" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-4 sm:p-5">
            <div>
              <span className="font-display text-[11px] tracking-[0.22em] text-[#FFB020]">
                MESA DE INVESTIGAÇÃO · CASO {room.roomCode}
              </span>
              <h1 className="font-display text-3xl leading-none text-[#F6EFE0] sm:text-4xl">
                QUEM ESTÁ MENTINDO ENTRE NÓS?
              </h1>
              <p className="mt-1 max-w-md text-xs font-semibold text-[#C7D2EA] sm:text-sm">
                Chame os investigadores, cruze as pistas e prepare a votação.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-[8px] border-2 border-[#0B0E1F] bg-[#E23B2E] px-3 py-1.5 font-display text-sm tracking-wide text-[#F6EFE0]">
              {room.players.length} NA MESA
            </div>
          </div>
        </section>

        {/* Barra de Status do Caso + Ações Rápidas */}
        <section className="bg-[#1A2145] rounded-[26px] border-4 border-[#0B0E1F] shadow-[0_7px_0_#0B0E1F] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63D2B0] text-[#0B0E1F] font-display font-bold text-sm border-2 border-[#0B0E1F]">
                <Users className="w-4 h-4 stroke-[2.8]" />
                {room.players.length}/8 investigador(es)
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4C8DFF] text-[#0B0E1F] font-bold text-xs sm:text-sm border-2 border-[#0B0E1F]">
                <Sparkles className="w-3.5 h-3.5 stroke-[2.6]" />
                Categoria: {room.settings.category}
              </span>

              {/* Seletor rápido de Quantidade de Impostores direto no Lobby */}
              {isHost ? (
                <div
                  role="group"
                  aria-label="Escolher quantidade de impostores"
                  className="inline-flex items-center gap-1 p-1 rounded-full bg-[#FFB020] text-[#0B0E1F] border-2 border-[#0B0E1F]"
                >
                  <span className="pl-2 pr-1 font-extrabold text-xs sm:text-sm">
                    🕵️ Impostores:
                  </span>
                  {([1, 2, 3] as const).map((count) => {
                    const selected = room.settings.impostors === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={selected}
                        aria-label={`Escolher ${count} ${
                          count === 1 ? "Impostor" : "Impostores"
                        }`}
                        onClick={() => onUpdateSettings({ impostors: count })}
                        className={`min-w-[30px] h-7 px-2 rounded-full font-display font-bold text-xs sm:text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A45] ${
                          selected
                            ? "bg-[#0B0E1F] text-[#FFB020]"
                            : "bg-white/75 text-[#0B0E1F] hover:bg-white"
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFB020] text-[#0B0E1F] font-bold text-xs sm:text-sm border-2 border-[#0B0E1F]">
                  🕵️ {room.settings.impostors}{" "}
                  {room.settings.impostors === 1 ? "Impostor" : "Impostores"}
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FF7A45] text-[#0B0E1F] font-bold text-xs sm:text-sm border-2 border-[#0B0E1F]">
                <Clock className="w-3.5 h-3.5 stroke-[2.6]" />
                Dica {room.settings.hintTime}s • Voto {room.settings.voteTime}s
              </span>

              {/* Indicador / Atalho rápido de Debate por Chat (Opcional) */}
              {isHost ? (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      debateEnabled: !room.settings.debateEnabled,
                    })
                  }
                  aria-pressed={room.settings.debateEnabled}
                  aria-label={
                    room.settings.debateEnabled
                      ? "Debate por chat ativado. Clique para desativar"
                      : "Debate por chat desativado. Clique para ativar"
                  }
                  title="Clique para ativar ou desativar o Debate por Chat"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs sm:text-sm border-2 border-[#0B0E1F] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020] ${
                    room.settings.debateEnabled
                      ? "bg-[#63D2B0] text-[#0B0E1F] hover:brightness-105"
                      : "bg-[#0A0D24] text-[#C7D2EA] hover:bg-[#2A3566]"
                  }`}
                >
                  {room.settings.debateEnabled ? (
                    <>
                      <MessageSquare className="w-3.5 h-3.5 stroke-[2.8]" />
                      <span>Debate Chat: ON ({room.settings.debateTime}s)</span>
                    </>
                  ) : (
                    <>
                      <MessageSquareOff className="w-3.5 h-3.5 stroke-[2.6]" />
                      <span>Debate Chat: OFF (Só Voz)</span>
                    </>
                  )}
                </button>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs sm:text-sm border-2 border-[#0B0E1F] ${
                    room.settings.debateEnabled
                      ? "bg-[#63D2B0] text-[#0B0E1F]"
                      : "bg-[#0A0D24] text-[#C7D2EA]"
                  }`}
                >
                  {room.settings.debateEnabled ? (
                    <>
                      <MessageSquare className="w-3.5 h-3.5 stroke-[2.8]" />
                      <span>Debate Chat: {room.settings.debateTime}s</span>
                    </>
                  ) : (
                    <>
                      <MessageSquareOff className="w-3.5 h-3.5 stroke-[2.6]" />
                      <span>Sem Debate Chat</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-bold text-[#C7D2EA]">
              Compartilhe o código{" "}
              <strong className="text-[#FFB020]">{room.roomCode}</strong> com
              seus amigos para encher a pista!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenAvatarPicker}
              aria-label="Trocar meu disfarce e apelido"
              className="flex-1 sm:flex-initial min-h-[48px] px-4 rounded-[20px] bg-[#FF7A45] text-[#0B0E1F] font-display font-bold text-sm sm:text-base border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
            >
              ✏️ Trocar meu disfarce
            </button>

            {isHost && (
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                aria-label="Abrir configurações da partida"
                className="min-h-[48px] px-4 rounded-[20px] bg-[#4C8DFF] text-[#0B0E1F] font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 border-3 border-[#0B0E1F] shadow-[0_4px_0_#0B0E1F] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
              >
                <Settings className="w-4 h-4 stroke-[2.8]" />
                <span>Regras</span>
              </button>
            )}
          </div>
        </section>

        {/* Grid de Fichas de Caso: 2 cols mobile, 3 tablet, 4 desktop */}
        <section aria-label="Jogadores na sala">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {room.players.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                isHost={player.id === room.hostId}
                isMe={player.id === myPlayerId}
                index={index}
              />
            ))}

            {Array.from({ length: emptySlotsCount }, (_, idx) => (
              <EmptyPlayerSlot
                key={`empty-${idx}`}
                slotNumber={room.players.length + idx + 1}
              />
            ))}
          </div>
        </section>

        {/* Área do Botão Principal de Início */}
        <section className="pt-2 flex flex-col items-center">
          {isHost ? (
            <button
              type="button"
              disabled={missingPlayers > 0}
              onClick={onStartGame}
              aria-label={hostButtonLabel}
              className={`w-full max-w-md min-h-[60px] px-6 rounded-[24px] font-display font-bold text-lg sm:text-xl border-4 border-[#0B0E1F] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45] ${
                missingPlayers > 0
                  ? "bg-[#4A358C] text-[#C7D2EA] cursor-not-allowed opacity-90 shadow-[0_4px_0_#0B0E1F]"
                  : "bg-[#FFB020] text-[#0B0E1F] shadow-[0_7px_0_#0B0E1F] hover:brightness-105 active:translate-y-1.5 active:shadow-[0_2px_0_#0B0E1F]"
              }`}
            >
              {hostButtonLabel}
            </button>
          ) : (
            <div className="w-full max-w-md min-h-[58px] px-5 py-3 rounded-[24px] bg-[#1A2145] border-3 border-[#0B0E1F] shadow-[0_5px_0_#0B0E1F] text-center flex items-center justify-center">
              <span className="font-display font-bold text-base sm:text-lg text-[#FFB020]">
                {missingPlayers > 0
                  ? missingPlayers === 1
                    ? "Precisamos de mais 1 pessoa! 🕵️"
                    : `Precisamos de mais ${missingPlayers} pessoas! 🕵️`
                  : "🎧 Tudo pronto! Aguardando o anfitrião começar o caso..."}
              </span>
            </div>
          )}
        </section>
      </main>

      {/* Modal de Configurações do Host */}
      {settingsOpen && isHost && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="host-settings-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#05070F]/80 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSettingsOpen(false);
          }}
        >
          <div className="w-full sm:max-w-lg bg-[#F6EFE0] text-[#0B0E1F] rounded-t-[28px] sm:rounded-[28px] border-t-4 sm:border-4 border-[#0B0E1F] shadow-[0_10px_0_#0B0E1F] overflow-hidden animate-pop-in">
            <div className="bg-[#1A2145] text-white px-5 py-4 border-b-4 border-[#0B0E1F] flex items-center justify-between">
              <h2
                id="host-settings-title"
                className="font-display text-xl font-bold text-[#FFB020]"
              >
                ⚙️ Regras do Caso
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Fechar configurações"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-2xl bg-[#E23B2E] text-white border-3 border-[#0B0E1F] shadow-[0_3px_0_#0B0E1F] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020]"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[78dvh] overflow-y-auto">
              {/* Quantidade de Impostores */}
              <div>
                <span className="block font-display font-bold text-base mb-2">
                  🕵️ Quantidade de Impostores
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {([1, 2, 3] as const).map((count) => {
                    const selected = room.settings.impostors === count;
                    const minPl = Math.max(3, count + 1);
                    return (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onUpdateSettings({ impostors: count })}
                        className={`min-h-[58px] px-2 py-2 rounded-[20px] flex flex-col items-center justify-center border-3 border-[#0B0E1F] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45] ${
                          selected
                            ? "bg-[#FFB020] shadow-[0_4px_0_#0B0E1F] -translate-y-0.5"
                            : "bg-white hover:bg-[#F5EBD6]"
                        }`}
                      >
                        <span className="font-display font-bold text-sm sm:text-base leading-tight">
                          {count} {count === 1 ? "Impostor" : "Impostores"}
                        </span>
                        <span className="text-[11px] font-extrabold text-[#5A6785] mt-0.5">
                          Mín. {minPl} pessoas
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Debate por Chat (Opcional) */}
              <div className="rounded-[22px] bg-[#EFE7D8] border-3 border-[#0B0E1F] p-3.5 space-y-3">
                <div>
                  <span className="block font-display font-bold text-base">
                    💬 Debate por Chat (Opcional)
                  </span>
                  <p className="text-xs font-bold text-[#5A6785]">
                    Abre uma roda de conversa por texto antes e durante a votação (ideal para jogar à distância!).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    aria-pressed={room.settings.debateEnabled}
                    onClick={() => onUpdateSettings({ debateEnabled: true })}
                    className={`min-h-[48px] px-3 rounded-[18px] font-display font-bold text-sm border-3 border-[#0B0E1F] inline-flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45] ${
                      room.settings.debateEnabled
                        ? "bg-[#63D2B0] shadow-[0_4px_0_#0B0E1F]"
                        : "bg-white hover:bg-[#DDF3E7]"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 stroke-[2.8]" />
                    <span>Ativado</span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={!room.settings.debateEnabled}
                    onClick={() => onUpdateSettings({ debateEnabled: false })}
                    className={`min-h-[48px] px-3 rounded-[18px] font-display font-bold text-sm border-3 border-[#0B0E1F] inline-flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45] ${
                      !room.settings.debateEnabled
                        ? "bg-[#FFB020] shadow-[0_4px_0_#0B0E1F]"
                        : "bg-white hover:bg-[#F5EBD6]"
                    }`}
                  >
                    <MessageSquareOff className="w-4 h-4 stroke-[2.8]" />
                    <span>Desativado (Só Voz)</span>
                  </button>
                </div>

                {room.settings.debateEnabled && (
                  <div className="pt-1">
                    <span className="block font-display font-bold text-sm mb-1.5">
                      Tempo de Debate
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {DEBATE_TIME_OPTIONS.map((seconds) => {
                        const selected = room.settings.debateTime === seconds;
                        return (
                          <button
                            key={seconds}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              onUpdateSettings({ debateTime: seconds })
                            }
                            className={`min-h-[44px] rounded-[16px] font-display font-bold text-sm border-3 border-[#0B0E1F] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45] ${
                              selected
                                ? "bg-[#FFB020] shadow-[0_3px_0_#0B0E1F]"
                                : "bg-white hover:bg-[#F5EBD6]"
                            }`}
                          >
                            {seconds}s
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Tempo de Dica */}
              <div>
                <span className="block font-display font-bold text-base mb-2">
                  Tempo por Dica
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {TIME_OPTIONS.map((seconds) => {
                    const selected = room.settings.hintTime === seconds;
                    return (
                      <button
                        key={seconds}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onUpdateSettings({ hintTime: seconds })}
                        className={`min-h-[48px] rounded-[18px] font-display font-bold text-base border-3 border-[#0B0E1F] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45] ${
                          selected
                            ? "bg-[#63D2B0] shadow-[0_4px_0_#0B0E1F]"
                            : "bg-white hover:bg-[#DDF3E7]"
                        }`}
                      >
                        {seconds}s
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tempo de Votação */}
              <div>
                <span className="block font-display font-bold text-base mb-2">
                  Tempo de Votação
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {TIME_OPTIONS.map((seconds) => {
                    const selected = room.settings.voteTime === seconds;
                    return (
                      <button
                        key={seconds}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onUpdateSettings({ voteTime: seconds })}
                        className={`min-h-[48px] rounded-[18px] font-display font-bold text-base border-3 border-[#0B0E1F] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45] ${
                          selected
                            ? "bg-[#4C8DFF] shadow-[0_4px_0_#0B0E1F]"
                            : "bg-white hover:bg-[#DDE9F8]"
                        }`}
                      >
                        {seconds}s
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categoria de Palavras */}
              <div>
                <span className="block font-display font-bold text-base mb-2">
                  Categoria de Palavras
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const selected = room.settings.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onUpdateSettings({ category: cat })}
                        className={`min-h-[48px] px-3 rounded-[18px] font-display font-bold text-sm border-3 border-[#0B0E1F] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB020] ${
                          selected
                            ? "bg-[#FF7A45] shadow-[0_4px_0_#0B0E1F]"
                            : "bg-white hover:bg-[#F6D9D0]"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Confirmar configurações"
                className="w-full min-h-[52px] rounded-[20px] bg-[#FFB020] text-[#0B0E1F] font-display font-bold text-lg border-3 border-[#0B0E1F] shadow-[0_5px_0_#0B0E1F] active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A45]"
              >
                Pronto!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
