import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entre Nós 🕵️ — Jogo Multiplayer de Dedução",
  description:
    "Entre Nós: jogo multiplayer em tempo real de dedução e blefe com palavras secretas, avatares personalizáveis e mesa de investigação.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0E1230] text-[#F6EFE0] antialiased">{children}</body>
    </html>
  );
}
