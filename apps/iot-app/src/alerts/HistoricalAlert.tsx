import React from "react";

import AlertCanceledIcon from "../Icons/AlertCanceledIcon";
import LostConnectionIcon from "../Icons/LostConnectionIcon";
import LowBatteryIcon from "../Icons/LowBatteryIcon";
import WarningIcon from "../Icons/WarningIcon";
import { useTheme } from "../functions/ThemeContext";

interface HistoryEntry {
  status: string;
  timestamp: Date;
}

interface HistoricalAlertProps {
  type: "warning" | "low-battery" | "alert-canceled" | "lost-connection";
  id_device: string;
  timestamp: Date;
  status: "open" | "resolved";
  history: HistoryEntry[];
  room?: string;
  patient?: string;
}

const iconMap = {
  warning: <WarningIcon />,
  "low-battery": <LowBatteryIcon />,
  "alert-canceled": <AlertCanceledIcon />,
  "lost-connection": <LostConnectionIcon />,
};

const HistoricalAlert: React.FC<HistoricalAlertProps> = ({
  type,
  id_device,
  timestamp,
  status,
  history,
  room,
  patient,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    return status === "open" ? "text-red-500" : "text-green-500";
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
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{iconMap[type]}</div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3
                className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Device ID: {id_device}
              </h3>
              {room && (
                <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Room: {room}
                </p>
              )}
              {patient && (
                <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Patient ID: {patient}
                </p>
              )}
            </div>
            <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(status)}`}>
              {status.toUpperCase()}
            </span>
          </div>

          <div className="mt-4">
            <h4
              className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              History:
            </h4>
            <div className="space-y-2">
              {history.map((entry, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className={getStatusColor(entry.status)}>{entry.status}</span>
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalAlert;
