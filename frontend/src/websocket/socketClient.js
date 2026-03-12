function inferApiOrigin() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window === "undefined") {
    return "http://localhost:4000";
  }

  return `${window.location.protocol}//${window.location.hostname}:4000`;
}

export function inferWsUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const apiOrigin = inferApiOrigin();
  const apiUrl = new URL(apiOrigin);
  const protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${apiUrl.host}/ws`;
}

export function createSocketClient(handlers) {
  const socket = new WebSocket(inferWsUrl());

  socket.addEventListener("open", handlers.onOpen);
  socket.addEventListener("close", handlers.onClose);
  socket.addEventListener("error", handlers.onError);
  socket.addEventListener("message", handlers.onMessage);

  return socket;
}

export async function postJson(path, body) {
  const response = await fetch(`${inferApiOrigin()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

export async function getJson(path) {
  const response = await fetch(`${inferApiOrigin()}${path}`);
  return response.json();
}

