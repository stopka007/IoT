import React from "react";

import { useTheme } from "../../functions/ThemeContext";

interface PatientDetailProps {
  name: string;
  battery: number;
  isActive: boolean;
  onClose: () => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ name, battery, isActive, onClose }) => {
  const { theme } = useTheme();
  const baseText = theme === "light" ? "text-black" : "text-white";
  const baseBg = theme === "light" ? "bg-white" : "bg-neutral-800";

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50`}>
      <div className={`p-6 rounded-lg shadow-lg w-[300px] ${baseBg} ${baseText}`}>
        <h2 className="text-xl font-bold mb-2">Detail pacienta</h2>
        <p>
          <strong>Jméno:</strong> {name}
        </p>
        <p>
          <strong>Baterie:</strong> {battery}%
        </p>
        <p>
          <strong>Status:</strong> {isActive ? "Aktivní" : "Neaktivní"}
        </p>

        <button
          className="mt-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          onClick={onClose}
        >
          Zavřít
        </button>
      </div>
    </div>
  );
};

export default PatientDetail;
