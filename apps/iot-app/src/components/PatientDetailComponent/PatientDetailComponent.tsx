import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useTheme } from "../../functions/ThemeContext";
import BatteryBar from "../BatteryBar";
import { User, mockUsers } from "../data";

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<User | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const found = mockUsers.find(p => p.id === id);
    setPatient(found ?? null);
  }, [id]);

  const containerClass = theme === "light" ? "bg-white text-gray-800" : "bg-neutral-700 text-white";
  const labelClass = theme === "light" ? "text-gray-600" : "text-gray-300";

  if (!patient) {
    return <div className="p-6 text-center text-2xl text-red-500">Pacient nebyl nalezen.</div>;
  }

  return (
    <div className="p-6 flex justify-center w-full">
      <div
        className={`${containerClass} shadow-md rounded-xl p-6 w-full max-w-xl border border-gray-300 dark:border-white/10`}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Detail pacienta</h2>

        <div className="mb-4">
          <span className={`${labelClass} font-semibold`}>Jméno:</span> {patient.name}
        </div>
        <div className="mb-4">
          <span className={`${labelClass} font-semibold`}>Věk:</span> {patient.age}
        </div>
        <div className="mb-4">
          <span className={`${labelClass} font-semibold`}>Pokoj:</span> {patient.room}
        </div>
        <div className="mb-4">
          <span className={`${labelClass} font-semibold`}>Nemoc:</span> {patient.illness}
        </div>
        <div className="mb-4">
          <span className={`${labelClass} font-semibold`}>Baterie:</span> {patient.battery}%
          <div className="flex items-center gap-1 p-3">
            <BatteryBar battery={patient.battery} />
          </div>
        </div>
        <div className="mb-4">
          <span className={`${labelClass} font-semibold`}>Stav zařízení:</span>{" "}
          {patient.isActive ? "Aktivní" : "Neaktivní"}
        </div>
        {patient.diagnosis && (
          <div className="mb-4">
            <span className={`${labelClass} font-semibold`}>Diagnóza:</span> {patient.diagnosis}
          </div>
        )}
        {patient.notes && (
          <div className="mb-4">
            <span className={`${labelClass} font-semibold`}>Poznámky:</span> {patient.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
