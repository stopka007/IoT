import React, { useEffect, useState } from "react";

import { fetchPatientByIdPatient } from "../functions/patientService";

import AlertModal from "./AlertModal";

interface AlertProps {
  type: "warning" | "low-battery" | "alert-canceled" | "lost-connection";
  title: string;
  message: string;
  room?: string;
  patient?: string;
}

const Alert: React.FC<AlertProps> = ({ type, title, message }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [room, setRoom] = useState<string | undefined>();
  const [patientName, setPatientName] = useState<string | undefined>();

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:1880/ws/alerts");

    socket.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "openAlert" && data.type === type) {
          setRoom(data.room?.toString() || undefined);

          if (data.patient) {
            try {
              const patientData = await fetchPatientByIdPatient(data.patient);
              setPatientName(patientData.name);
            } catch (error) {
              console.error("Error fetching patient:", error);
              setPatientName(undefined);
            }
          }

          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error parsing Websocket message:", error);
      }
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
          patient={patientName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Alert;
