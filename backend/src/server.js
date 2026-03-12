import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { SimulationManager } from "./trafficController/SimulationManager.js";
import { createSocketServer } from "./websocket/socketServer.js";

dotenv.config();

export function createApp({ manager }) {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN?.split(",") ?? true,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      generatedAt: new Date().toISOString(),
    });
  });

  app.get("/api/state", (_request, response) => {
    response.json(manager.getSnapshot("http_state"));
  });

  app.post("/api/control", (request, response) => {
    response.json(manager.handleControl(request.body?.action));
  });

  app.post("/api/config", (request, response) => {
    response.json(manager.configure(request.body ?? {}));
  });

  return app;
}

export function createServer() {
  const tickIntervalMs = Number(process.env.TICK_INTERVAL_MS ?? 900);
  const manager = new SimulationManager({ tickIntervalMs });
  const app = createApp({ manager });
  const server = http.createServer(app);
  const socketServer = createSocketServer({ server, manager });

  return {
    app,
    server,
    manager,
    socketServer,
  };
}

export async function startServer() {
  const { server } = createServer();
  const port = Number(process.env.PORT ?? 4000);

  return new Promise((resolve) => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`Traffic simulator backend running on port ${port}`);
      resolve(server);
    });
  });
}

const currentFilePath = fileURLToPath(import.meta.url);
const executedFilePath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (executedFilePath && currentFilePath === executedFilePath) {
  startServer();
}
