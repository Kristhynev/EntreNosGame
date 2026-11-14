import http from "node:http";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import { attachGameSocketServer } from "./gameManager.js";
import { AVATAR_SCHEMA } from "./avatarSchema.js";
import { ALLOWED_CATEGORIES } from "./words.js";

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";
const allowedOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : "*";

const app = express();
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "entre-nos-server",
    websocket: "socket.io",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "entre-nos-server" });
});

app.get("/api/catalog", (_req, res) => {
  res.json({
    avatarSchema: AVATAR_SCHEMA,
    categories: ALLOWED_CATEGORIES,
  });
});

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

attachGameSocketServer(io);

httpServer.listen(PORT, HOST, () => {
  console.log(`🎉 Entre Nós Server rodando em http://${HOST}:${PORT}`);
});
