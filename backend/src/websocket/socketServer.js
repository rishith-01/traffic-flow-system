import { WebSocketServer } from "ws";

function sendJson(socket, payload) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function handleIncomingMessage(manager, message) {
  switch (message.type) {
    case "control":
      return manager.handleControl(message.action);
    case "configure":
      return manager.configure(message.payload);
    default:
      return manager.getSnapshot("unknown_message");
  }
}

export function createSocketServer({ server, manager }) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  const clients = new Set();

  const broadcast = (snapshot) => {
    const payload = JSON.stringify({
      type: "state:update",
      payload: snapshot,
    });

    clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    });
  };

  wss.on("connection", (socket) => {
    clients.add(socket);
    manager.setClientCount(clients.size);
    sendJson(socket, {
      type: "state:init",
      payload: manager.getSnapshot("socket_connected"),
    });

    socket.on("message", (rawMessage) => {
      try {
        const parsedMessage = JSON.parse(rawMessage.toString());
        const snapshot = handleIncomingMessage(manager, parsedMessage);

        sendJson(socket, {
          type: "system:ack",
          payload: {
            reason: snapshot.reason,
          },
        });
      } catch (error) {
        sendJson(socket, {
          type: "system:error",
          payload: {
            message: error instanceof Error ? error.message : "Malformed message",
          },
        });
      }
    });

    socket.on("close", () => {
      clients.delete(socket);
      manager.setClientCount(clients.size);
    });
  });

  manager.setBroadcastHandler(broadcast);

  return {
    wss,
    broadcast,
  };
}

