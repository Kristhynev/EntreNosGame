import type { Server as HTTPServer } from "node:http";
import type { Socket as NetSocket } from "node:net";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { attachGameSocketServer } from "../../../server/gameManager.js";

interface SocketServerWithIO extends HTTPServer {
  io?: SocketIOServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: SocketServerWithIO;
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  const httpServer = res.socket?.server;

  if (httpServer && !httpServer.io) {
    const io = new SocketIOServer(httpServer, {
      path: "/api/socketio",
      addTrailingSlash: false,
      destroyUpgrade: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    attachGameSocketServer(io);
    httpServer.io = io;
  }

  res.status(200).json({ ok: true, socketPath: "/api/socketio" });
}
