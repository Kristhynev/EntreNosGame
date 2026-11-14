"use client";

import React from "react";
import dynamic from "next/dynamic";

/**
 * O jogo depende de identidade aleatória (avatar + nickname) e de WebSocket,
 * por isso é carregado apenas no cliente — sem HTML de espera e sem
 * divergência de hidratação.
 */
const ImpostorPartyApp = dynamic(
  () =>
    import("../../client/src/App").then((mod) => ({
      default: mod.ImpostorPartyApp,
    })),
  { ssr: false }
);

interface BoundaryState {
  hasError: boolean;
}

class GameErrorBoundary extends React.Component<
  { children: React.ReactNode },
  BoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[Entre Nós] erro de execução:", error);
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#0E1230] px-6 text-center">
          <h1 className="font-display text-4xl text-[#FFB020]">
            O CASO DEU ERRADO
          </h1>
          <p className="max-w-sm text-sm font-semibold text-[#C7D2EA]">
            Algo interrompeu a investigação. Recarregue a página para abrir o
            caso novamente.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="min-h-[48px] rounded-[8px] border-3 border-[#0B0E1F] bg-[#FFB020] px-6 font-display text-lg tracking-wide text-[#0B0E1F] shadow-[0_5px_0_#05070F]"
          >
            Recarregar
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default function ClientRoot() {
  return (
    <GameErrorBoundary>
      <ImpostorPartyApp socketMode="integrated" />
    </GameErrorBoundary>
  );
}
