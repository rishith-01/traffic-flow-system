import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createInitialSnapshot } from "../utils/formatters.js";
import {
  createSocketClient,
  getJson,
  postJson,
} from "../websocket/socketClient.js";

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [snapshot, setSnapshot] = useState(createInitialSnapshot);
  const [status, setStatus] = useState("connecting");
  const [lastAck, setLastAck] = useState("Linking to traffic controller");
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromHttp() {
      try {
        const data = await getJson("/api/state");

        if (!cancelled) {
          startTransition(() => {
            setSnapshot(data);
          });
        }
      } catch {
        if (!cancelled) {
          setLastAck("Backend HTTP fallback unavailable");
        }
      }
    }

    function scheduleReconnect() {
      if (cancelled) {
        return;
      }

      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        if (!cancelled) {
          connect();
        }
      }, 1600);
    }

    function connect() {
      if (cancelled) {
        return;
      }

      setStatus("connecting");
      const socket = createSocketClient({
        onOpen: () => {
          if (cancelled) {
            return;
          }

          setStatus("connected");
          setLastAck("WebSocket link established");
        },
        onClose: () => {
          if (cancelled) {
            return;
          }

          setStatus("reconnecting");
          setLastAck("Socket closed, retrying");
          scheduleReconnect();
        },
        onError: () => {
          if (cancelled) {
            return;
          }

          setStatus("degraded");
          setLastAck("Socket error detected");
        },
        onMessage: (event) => {
          if (cancelled) {
            return;
          }

          const message = JSON.parse(event.data);

          if (message.type === "state:init" || message.type === "state:update") {
            startTransition(() => {
              setSnapshot(message.payload);
            });
          }

          if (message.type === "system:ack") {
            setLastAck(message.payload.reason);
          }
        },
      });

      socketRef.current = socket;
    }

    hydrateFromHttp();
    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, []);

  async function dispatchMessage(message, fallbackPath) {
    const socket = socketRef.current;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return;
    }

    const data = await postJson(fallbackPath, message.payload ?? { action: message.action });
    startTransition(() => {
      setSnapshot(data);
    });
  }

  async function control(action) {
    await dispatchMessage(
      { type: "control", action, payload: { action } },
      "/api/control",
    );
  }

  async function configure(payload) {
    await dispatchMessage({ type: "configure", payload }, "/api/config");
  }

  return (
    <SimulationContext.Provider
      value={{
        snapshot,
        live: snapshot.live,
        comparison: snapshot.comparison,
        config: snapshot.config,
        connectionStatus: status,
        lastAck,
        control,
        configure,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationContext() {
  const value = useContext(SimulationContext);

  if (!value) {
    throw new Error("useSimulationContext must be used inside SimulationProvider");
  }

  return value;
}
