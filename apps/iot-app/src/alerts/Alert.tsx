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
  console.log("socket");

  useEffect(() => {
    console.log("effect");
    const socket = new WebSocket("ws://127.0.0.1:1880/ws/alerts");
    console.log(socket);

    socket.onmessage = event => {
      console.log("Websocket");
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
