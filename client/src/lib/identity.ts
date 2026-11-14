import type {
  AccessoryVariant,
  AvatarConfig,
  BgColorVariant,
  EyesVariant,
  HairColorVariant,
  HairVariant,
  MouthVariant,
  PlayerIdentity,
  SkinVariant,
} from "../types/game";

export const STORAGE_KEY = "impostor_player";
const TAB_OVERRIDE_KEY = "impostor_player_tab_isolated";
const ACTIVE_ROOM_KEY = "impostor_active_room";

export const AVATAR_CATALOG: {
  skin: SkinVariant[];
  hair: HairVariant[];
  hairColor: HairColorVariant[];
  eyes: EyesVariant[];
  mouth: MouthVariant[];
  accessory: AccessoryVariant[];
  bgColor: BgColorVariant[];
} = {
  skin: ["skin_01", "skin_02", "skin_03", "skin_04", "skin_05", "skin_06"],
  hair: [
    "hair_short",
    "hair_curly",
    "hair_long",
    "hair_bun",
    "hair_mohawk",
    "hair_afro",
    "hair_ponytail",
    "hair_bald",
    "hair_spiky",
    "hair_wavy",
  ],
  hairColor: [
    "hair_black",
    "hair_brown",
    "hair_blonde",
    "hair_red",
    "hair_blue",
    "hair_pink",
    "hair_green",
    "hair_purple",
  ],
  eyes: [
    "eyes_happy",
    "eyes_wink",
    "eyes_sleepy",
    "eyes_star",
    "eyes_angry",
    "eyes_cute",
    "eyes_round",
    "eyes_cool",
  ],
  mouth: [
    "mouth_smile",
    "mouth_grin",
    "mouth_neutral",
    "mouth_surprised",
    "mouth_tongue",
    "mouth_sad",
  ],
  accessory: [
    "acc_none",
    "acc_glasses",
    "acc_sunglasses",
    "acc_hat_party",
    "acc_crown",
    "acc_bowtie",
    "acc_headphones",
    "acc_mustache",
    "acc_flower",
  ],
  bgColor: [
    "#FFD93D",
    "#FF6B9D",
    "#A8E6CF",
    "#6BCBFF",
    "#FF8C42",
    "#B983FF",
    "#FF5C5C",
    "#4ECDC4",
  ],
};

export const SKIN_PALETTES: Record<
  SkinVariant,
  { base: string; shadow: string; blush: string; label: string }
> = {
  skin_01: { base: "#F0D5BA", shadow: "#C9A98A", blush: "#D9B79A", label: "Tom 1" },
  skin_02: { base: "#E2B892", shadow: "#B98D68", blush: "#CE9F79", label: "Tom 2" },
  skin_03: { base: "#C89773", shadow: "#9C6E4C", blush: "#B07F5B", label: "Tom 3" },
  skin_04: { base: "#A5734E", shadow: "#7D5233", blush: "#8E5D3B", label: "Tom 4" },
  skin_05: { base: "#7C5033", shadow: "#573720", blush: "#663F27", label: "Tom 5" },
  skin_06: { base: "#4B2F1D", shadow: "#301B10", blush: "#3C2416", label: "Tom 6" },
};

export const HAIR_COLOR_PALETTES: Record<
  HairColorVariant,
  { base: string; dark: string; highlight: string; label: string }
> = {
  hair_black: { base: "#1B1E2C", dark: "#0B0E1F", highlight: "#4A5270", label: "Preto" },
  hair_brown: { base: "#513825", dark: "#33220F", highlight: "#7C5A3C", label: "Castanho" },
  hair_blonde: { base: "#C9A24A", dark: "#9A7630", highlight: "#E8C982", label: "Loiro" },
  hair_red: { base: "#8E3B2A", dark: "#652417", highlight: "#B85C42", label: "Ruivo" },
  hair_blue: { base: "#2B4C7E", dark: "#1A3358", highlight: "#4C74A8", label: "Azul aço" },
  hair_pink: { base: "#8A4A63", dark: "#5F2F42", highlight: "#B06D87", label: "Vinho" },
  hair_green: { base: "#2F5B4A", dark: "#1C3B30", highlight: "#4C8570", label: "Verde musgo" },
  hair_purple: { base: "#4B3A6B", dark: "#302547", highlight: "#715CA0", label: "Violeta" },
};

export const HAIR_LABELS: Record<HairVariant, string> = {
  hair_short: "Corte curto",
  hair_curly: "Cacheado",
  hair_long: "Longo",
  hair_bun: "Coque",
  hair_mohawk: "Moicano",
  hair_afro: "Black power",
  hair_ponytail: "Rabo de cavalo",
  hair_bald: "Careca",
  hair_spiky: "Espetado",
  hair_wavy: "Ondulado",
};

export const EYES_LABELS: Record<EyesVariant, string> = {
  eyes_happy: "Cansado",
  eyes_wink: "Piscadela",
  eyes_sleepy: "Sonolento",
  eyes_star: "Em choque",
  eyes_angry: "Desconfiado",
  eyes_cute: "Inocente",
  eyes_round: "Atento",
  eyes_cool: "Olhar frio",
};

export const MOUTH_LABELS: Record<MouthVariant, string> = {
  mouth_smile: "Sorriso torto",
  mouth_grin: "Riso aberto",
  mouth_neutral: "Linha reta",
  mouth_surprised: "Suspiro",
  mouth_tongue: "Língua",
  mouth_sad: "Derrotado",
};

export const ACCESSORY_LABELS: Record<AccessoryVariant, string> = {
  acc_none: "Nenhum",
  acc_glasses: "Óculos de aro",
  acc_sunglasses: "Óculos escuros",
  acc_hat_party: "Fedora",
  acc_crown: "Distintivo",
  acc_bowtie: "Gravata",
  acc_headphones: "Ponto de escuta",
  acc_mustache: "Bigode",
  acc_flower: "Monóculo",
};

export const BG_LABELS: Record<BgColorVariant, string> = {
  "#FFD93D": "Holofote",
  "#FF6B9D": "Neon",
  "#A8E6CF": "Névoa",
  "#6BCBFF": "Arquivo frio",
  "#FF8C42": "Âmbar",
  "#B983FF": "Noir",
  "#FF5C5C": "Alarme",
  "#4ECDC4": "Ciano",
};

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const FUN_NOUNS = [
  "Raposa",
  "Capivara",
  "Pinguim",
  "Tucano",
  "Panda",
  "Coruja",
  "Polvo",
  "Tigre",
  "Coala",
  "Lontra",
  "Gato",
  "Lobo",
  "Arara",
  "Camaleao",
];

const FUN_ADJECTIVES = [
  "Rosa",
  "Neon",
  "Pop",
  "Vip",
  "Chic",
  "Azul",
  "Doce",
  "Top",
  "Fera",
  "Show",
  "Zen",
  "Flash",
];

export function generateFunNickname(): string {
  const noun = pickRandom(FUN_NOUNS);
  const adj = pickRandom(FUN_ADJECTIVES);
  const num = Math.floor(10 + Math.random() * 89);
  return `${noun}${adj}${num}`.slice(0, 15);
}

export function generateRandomAvatar(): AvatarConfig {
  return {
    skin: pickRandom(AVATAR_CATALOG.skin),
    hair: pickRandom(AVATAR_CATALOG.hair),
    hairColor: pickRandom(AVATAR_CATALOG.hairColor),
    eyes: pickRandom(AVATAR_CATALOG.eyes),
    mouth: pickRandom(AVATAR_CATALOG.mouth),
    accessory: pickRandom(AVATAR_CATALOG.accessory),
    bgColor: pickRandom(AVATAR_CATALOG.bgColor),
  };
}

export function isValidClientAvatar(raw: unknown): raw is AvatarConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const obj = raw as Record<string, unknown>;
  return (
    typeof obj.skin === "string" &&
    (AVATAR_CATALOG.skin as string[]).includes(obj.skin) &&
    typeof obj.hair === "string" &&
    (AVATAR_CATALOG.hair as string[]).includes(obj.hair) &&
    typeof obj.hairColor === "string" &&
    (AVATAR_CATALOG.hairColor as string[]).includes(obj.hairColor) &&
    typeof obj.eyes === "string" &&
    (AVATAR_CATALOG.eyes as string[]).includes(obj.eyes) &&
    typeof obj.mouth === "string" &&
    (AVATAR_CATALOG.mouth as string[]).includes(obj.mouth) &&
    typeof obj.accessory === "string" &&
    (AVATAR_CATALOG.accessory as string[]).includes(obj.accessory) &&
    typeof obj.bgColor === "string" &&
    (AVATAR_CATALOG.bgColor as string[]).includes(obj.bgColor)
  );
}

function parseStoredIdentity(rawJson: string | null): PlayerIdentity | null {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson) as Partial<PlayerIdentity>;
    if (
      typeof parsed.playerId === "string" &&
      parsed.playerId.length >= 6 &&
      typeof parsed.nickname === "string" &&
      parsed.nickname.trim().length > 0 &&
      isValidClientAvatar(parsed.avatar)
    ) {
      return {
        playerId: parsed.playerId,
        nickname: parsed.nickname.trim().slice(0, 15),
        avatar: parsed.avatar,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function createFreshIdentity(): PlayerIdentity {
  return {
    playerId: generateUUID(),
    nickname: generateFunNickname(),
    avatar: generateRandomAvatar(),
  };
}
/* ------------------------------------------------------------------ *
 * Camada de persistência à prova de falhas.
 * Navegadores em modo privado, iframes restritos ou políticas de
 * armazenamento bloqueado lançam SecurityError ao acessar localStorage.
 * Nesses casos caímos para um armazenamento em memória para que o jogo
 * continue funcionando normalmente durante a sessão.
 * ------------------------------------------------------------------ */

const memoryStore = new Map<string, string>();

function readStorage(kind: "local" | "session", key: string): string | null {
  const fallbackKey = `${kind}:${key}`;
  try {
    if (typeof window !== "undefined") {
      const storage =
        kind === "local" ? window.localStorage : window.sessionStorage;
      const value = storage.getItem(key);
      if (value !== null) {
        memoryStore.set(fallbackKey, value);
        return value;
      }
    }
  } catch {
    /* acesso bloqueado — usa o espelho em memória */
  }
  return memoryStore.get(fallbackKey) ?? null;
}

function writeStorage(
  kind: "local" | "session",
  key: string,
  value: string | null
): void {
  const fallbackKey = `${kind}:${key}`;
  if (value === null) {
    memoryStore.delete(fallbackKey);
  } else {
    memoryStore.set(fallbackKey, value);
  }
  try {
    if (typeof window !== "undefined") {
      const storage =
        kind === "local" ? window.localStorage : window.sessionStorage;
      if (value === null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, value);
      }
    }
  } catch {
    /* segue apenas com o espelho em memória */
  }
}

let cachedIdentity: PlayerIdentity | null = null;

/**
 * Carrega a identidade salva ou gera uma nova imediatamente.
 * Nunca lança exceção e nunca retorna vazio.
 */
export function loadOrCreateIdentity(): {
  identity: PlayerIdentity;
  isIsolatedTab: boolean;
} {
  if (cachedIdentity) {
    return { identity: cachedIdentity, isIsolatedTab: false };
  }

  const tabIsolated = parseStoredIdentity(readStorage("session", TAB_OVERRIDE_KEY));
  if (tabIsolated) {
    cachedIdentity = tabIsolated;
    return { identity: tabIsolated, isIsolatedTab: true };
  }

  const saved = parseStoredIdentity(readStorage("local", STORAGE_KEY));
  if (saved) {
    cachedIdentity = saved;
    return { identity: saved, isIsolatedTab: false };
  }

  const fresh = createFreshIdentity();
  writeStorage("local", STORAGE_KEY, JSON.stringify(fresh));
  cachedIdentity = fresh;
  return { identity: fresh, isIsolatedTab: false };
}

/**
 * Persiste a identidade (localStorage) ou a versão isolada da aba (sessionStorage).
 */
export function saveIdentity(
  identity: PlayerIdentity,
  isIsolatedTab = false
): void {
  const clean: PlayerIdentity = {
    playerId: identity.playerId,
    nickname: identity.nickname.trim().slice(0, 15) || generateFunNickname(),
    avatar: identity.avatar,
  };

  cachedIdentity = clean;
  writeStorage(
    isIsolatedTab ? "session" : "local",
    isIsolatedTab ? TAB_OVERRIDE_KEY : STORAGE_KEY,
    JSON.stringify(clean)
  );
}

/**
 * Cria uma identidade separada exclusiva desta aba (para testar multiplayer).
 */
export function switchToIsolatedTabIdentity(): PlayerIdentity {
  const fresh = createFreshIdentity();
  cachedIdentity = fresh;
  writeStorage("session", TAB_OVERRIDE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function getSavedRoomCode(isIsolatedTab = false): string | null {
  return readStorage(
    isIsolatedTab ? "session" : "local",
    ACTIVE_ROOM_KEY
  );
}

export function setSavedRoomCode(
  roomCode: string | null,
  isIsolatedTab = false
): void {
  writeStorage(
    isIsolatedTab ? "session" : "local",
    ACTIVE_ROOM_KEY,
    roomCode
  );
}
