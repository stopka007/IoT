import React from "react";

import AlertCanceledIcon from "../Icons/AlertCanceledIcon";
import LostConnectionIcon from "../Icons/LostConnectionIcon";
import LowBatteryIcon from "../Icons/LowBatteryIcon";
import WarningIcon from "../Icons/WarningIcon";

interface AlertModalProps {
  type: "warning" | "low-battery" | "alert-canceled" | "lost-connection";
  title: string;
  message: string;
  room?: string;
  patient?: string;
  onClose: () => void;
}

const iconMap = {
  warning: <WarningIcon />,
  "low-battery": <LowBatteryIcon />,
  "alert-canceled": <AlertCanceledIcon />,
  "lost-connection": <LostConnectionIcon />,
};

const AlertModal: React.FC<AlertModalProps> = ({
  type,
  title,
  message,
  room,
  patient,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-60">
      <div className="bg-white text-black p-6 rounded-xl shadow-md w-[90%] max-w-md flex flex-col items-center text-center border-8 border-white">
        <div className="mb-4">{iconMap[type]}</div>
        <h3 className="text-2xl font-semibold mb-4">{title}</h3>
        <p className="mb-1">{message}</p>
        {room && <p className="mb-1">Pokoj: {room}</p>}
        {patient && <p className="mb-1">Pacient: {patient}</p>}
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-green-400 font-medium border border-green-300 hover:bg-green-500 rounded text-white transition ease-in-out hover:border-green-500 duration-300 hover:shadow-md"
          >
            Ok
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-neutral-400 font-medium border border-gray-300 hover:bg-gray-600 rounded text-white transition ease-in-out hover:border-gray-600 duration-300 hover:shadow-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
