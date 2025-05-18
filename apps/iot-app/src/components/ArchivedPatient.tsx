import React from "react";

import { useTheme } from "../functions/ThemeContext";

interface ArchivedPatientProps {
  name: string;
  room: number;
  illness?: string;
  age?: number;
  status?: string;
  notes?: string;
}

const ArchivedPatient: React.FC<ArchivedPatientProps> = ({
  name,
  room,
  illness,
  age,
  status,
  notes,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "hospitalized":
        return "text-blue-500";
      case "released":
        return "text-green-500";
      case "deceased":
        return "text-red-500";
      default:
        return isDark ? "text-gray-300" : "text-gray-600";
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow
        ${
          isDark
            ? "bg-neutral-800 border-neutral-700 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            {name}
          </h3>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Room: {room}
          </p>
          {age && (
            <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Age: {age}
            </p>
          )}
          {illness && (
            <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Illness: {illness}
            </p>
          )}
          {status && <p className={`text-sm mb-1 ${getStatusColor(status)}`}>Status: {status}</p>}
        </div>
      </div>
      {notes && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{notes}</p>
        </div>
      )}
    </div>
  );
};

export default ArchivedPatient;
