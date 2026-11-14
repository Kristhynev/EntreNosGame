import type { Server as SocketIOServer } from "socket.io";

export function attachGameSocketServer(io: SocketIOServer): SocketIOServer;
export function serializeRoom(room: unknown): Record<string, unknown>;
