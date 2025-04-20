import React, { useEffect, useState } from "react";

import AlertModal from "./AlertModal";

interface AlertProps {
  type: "warning" | "low-battery" | "alert-canceled" | "lost-connection";
  title: string;
  message: string;
  room?: string;
  pacient?: string;
}

const Alert: React.FC<AlertProps> = ({ type, title, message }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [room, setRoom] = useState<string | undefined>();
  const [pacient, setPacient] = useState<string | undefined>();

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:1880/ws/alerts");

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "openAlert" && data.type === type) {
          setRoom(data.room || undefined);
          setPacient(data.pacient || undefined);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error parsing Websocket message:", error);
      }
    };
    socket.onerror = error => {
      console.error("Websocket error:", error);
    };
    return () => {
      socket.close();
    };
  }, [type]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:1880/ws/battery");

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "openAlert" && data.type === type) {
          setRoom(data.room || undefined);
          setPacient(data.pacient || undefined);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error parsing Websocket message:", error);
      }
    };
    socket.onerror = error => {
      console.error("Websocket error:", error);
    };
    return () => {
      socket.close();
    };
  }, [type]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:1880/ws/alert-canceled");

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "openAlert" && data.type === type) {
          setRoom(data.room || undefined);
          setPacient(data.pacient || undefined);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error parsing Websocket message:", error);
      }
    };
    socket.onerror = error => {
      console.error("Websocket error:", error);
    };
    return () => {
      socket.close();
    };
  }, [type]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 hover:shadow-xs hover:shadow-gray-600/50 transition"
      >
        {title}
      </button>

      {isOpen && (
        <AlertModal
          type={type}
          title={title}
          message={message}
          room={room}
          pacient={pacient}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Alert;
