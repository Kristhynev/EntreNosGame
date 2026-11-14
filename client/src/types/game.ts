export type SkinVariant =
  | "skin_01"
  | "skin_02"
  | "skin_03"
  | "skin_04"
  | "skin_05"
  | "skin_06";

export type HairVariant =
  | "hair_short"
  | "hair_curly"
  | "hair_long"
  | "hair_bun"
  | "hair_mohawk"
  | "hair_afro"
  | "hair_ponytail"
  | "hair_bald"
  | "hair_spiky"
  | "hair_wavy";

export type HairColorVariant =
  | "hair_black"
  | "hair_brown"
  | "hair_blonde"
  | "hair_red"
  | "hair_blue"
  | "hair_pink"
  | "hair_green"
  | "hair_purple";

export type EyesVariant =
  | "eyes_happy"
  | "eyes_wink"
  | "eyes_sleepy"
  | "eyes_star"
  | "eyes_angry"
  | "eyes_cute"
  | "eyes_round"
  | "eyes_cool";

export type MouthVariant =
  | "mouth_smile"
  | "mouth_grin"
  | "mouth_neutral"
  | "mouth_surprised"
  | "mouth_tongue"
  | "mouth_sad";

export type AccessoryVariant =
  | "acc_none"
  | "acc_glasses"
  | "acc_sunglasses"
  | "acc_hat_party"
  | "acc_crown"
  | "acc_bowtie"
  | "acc_headphones"
  | "acc_mustache"
  | "acc_flower";

export type BgColorVariant =
  | "#FFD93D"
  | "#FF6B9D"
  | "#A8E6CF"
  | "#6BCBFF"
  | "#FF8C42"
  | "#B983FF"
  | "#FF5C5C"
  | "#4ECDC4";

export interface AvatarConfig {
  skin: SkinVariant;
  hair: HairVariant;
  hairColor: HairColorVariant;
  eyes: EyesVariant;
  mouth: MouthVariant;
  accessory: AccessoryVariant;
  bgColor: BgColorVariant;
}

export interface PlayerIdentity {
  playerId: string;
  nickname: string;
  avatar: AvatarConfig;
}

export type RoomStatus =
  | "lobby"
  | "playing"
  | "debate"
  | "voting"
  | "guess"
  | "ended";

export type WordCategory =
  | "Comida"
  | "Lugares"
  | "Animais"
  | "Filmes"
  | "Aleatório";

export type ImpostorCount = 1 | 2 | 3;

export interface RoomSettings {
  impostors: ImpostorCount;
  hintTime: 30 | 45 | 60;
  debateEnabled: boolean;
  debateTime: 30 | 45 | 60 | 90;
  voteTime: 30 | 45 | 60;
  category: WordCategory;
}

export interface RoomPlayer {
  id: string;
  nickname: string;
  avatar: AvatarConfig;
  isReady: boolean;
  isAlive: boolean;
  connected: boolean;
  isImpostor?: boolean;
}

export interface HintEntry {
  id: string;
  playerId: string;
  nickname: string;
  avatar: AvatarConfig;
  text: string;
  round: number;
  timedOut?: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  nickname: string;
  avatar: AvatarConfig;
  text: string;
  round: number;
  createdAt: number;
}

export interface VoteResultPayload {
  tally: Record<string, number>;
  votesByPlayer: Record<string, string>;
  eliminatedPlayerId: string | null;
  eliminatedPlayer: RoomPlayer | null;
  wasImpostor: boolean;
  tie: boolean;
  skipped: boolean;
}

export interface GameOverPayload {
  winner: "crew" | "impostor";
  reason: string;
  impostorId: string | null;
  impostorIds: string[];
  secretWord: string;
  category: string;
  guessAttempt?: string | null;
}

export interface RoomGameData {
  category: string;
  totalImpostors?: number;
  aliveImpostorsCount?: number;
  currentTurnIndex: number;
  currentTurnPlayerId: string | null;
  turnOrder: string[];
  hints: HintEntry[];
  chatMessages: ChatMessage[];
  skipDebatePlayerIds: string[];
  votedPlayerIds: string[];
  round: number;
  phaseEndsAt: number | null;
  guessingImpostorId: string | null;
  lastVoteResult: VoteResultPayload | null;
  secretWord?: string;
  resultSummary?: GameOverPayload | null;
}

export interface RoomState {
  roomCode: string;
  hostId: string;
  status: RoomStatus;
  players: RoomPlayer[];
  settings: RoomSettings;
  gameData: RoomGameData;
}
