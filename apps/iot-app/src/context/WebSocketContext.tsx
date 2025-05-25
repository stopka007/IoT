import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type DeviceUpdate = {
  id: string;
  help_needed: boolean;
  updatedAt: string;
};

type WebSocketContextType = {
  lastUpdate: DeviceUpdate | null;
};

const WebSocketContext = createContext<WebSocketContextType>({ lastUpdate: null });

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastUpdate, setLastUpdate] = useState<DeviceUpdate | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket("ws://localhost:3000/api/ws");

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📡 Změna zařízení:", data);
        setLastUpdate(data);
      };

      ws.current.onclose = () => {
        console.warn("❌ WebSocket odpojen, znovupřipojení za 2s...");
        setTimeout(connect, 2000);
      };
    };

    connect();

    return () => ws.current?.close();
  }, []);

  return (
    <WebSocketContext.Provider value={{ lastUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
