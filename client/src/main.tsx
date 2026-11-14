import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ImpostorPartyApp } from "./App";

const SOCKET_URL_STORAGE_KEY = "impostor_socket_url";

function safeRead(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* armazenamento bloqueado — ignora */
  }
}

function resolveStandaloneServerUrl(): string {
  const metaEnv = (
    import.meta as unknown as { env?: Record<string, string | undefined> }
  ).env;

  try {
    const params = new URLSearchParams(window.location.search);
    const queryServer = params.get("server")?.trim();
    if (queryServer && /^https?:\/\//i.test(queryServer)) {
      safeWrite(SOCKET_URL_STORAGE_KEY, queryServer);
      return queryServer;
    }

    const savedServer = safeRead(SOCKET_URL_STORAGE_KEY)?.trim();
    if (savedServer && /^https?:\/\//i.test(savedServer)) {
      return savedServer;
    }
  } catch {
    /* ambiente sem URLSearchParams/localStorage — usa o padrão */
  }

  return metaEnv?.VITE_SOCKET_URL?.trim() || "http://localhost:3001";
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ImpostorPartyApp
        socketMode="standalone"
        standaloneUrl={resolveStandaloneServerUrl()}
      />
    </React.StrictMode>
  );
}
