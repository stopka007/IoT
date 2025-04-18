import React, { useState } from "react";

import AlertModal from "./AlertModal";

interface AlertProps {
  type: "warning" | "low-battery" | "alert-canceled" | "lost-connection";
  title: string;
  message: string;
  room?: string;
  pacient?: string;
}

const Alert: React.FC<AlertProps> = ({ type, title, message, room, pacient }) => {
  const [isOpen, setIsOpen] = useState(false);

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
