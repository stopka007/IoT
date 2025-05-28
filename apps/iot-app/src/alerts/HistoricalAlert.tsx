import React, { useEffect, useState } from "react";

import AlertCanceledIcon from "../Icons/AlertCanceledIcon";
import LostConnectionIcon from "../Icons/LostConnectionIcon";
import LowBatteryIcon from "../Icons/LowBatteryIcon";
import WarningIcon from "../Icons/WarningIcon";
import apiClient from "../api/axiosConfig";
import { useTheme } from "../functions/ThemeContext";
import { fetchPatientByIdPatient } from "../functions/patientService";

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
  patient_name?: string;
  patient_id?: string;
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
  status,
  history,
  room,
  patient_name,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [patientName, setPatientName] = useState<string | null>(null);
  const [, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Only fetch patient name if not provided as prop
  useEffect(() => {
    if (patient_name) {
      setPatientName(patient_name);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchPatientName() {
      setLoading(true);
      try {
        // 1. Fetch device by id_device
        const deviceResp = await apiClient.get(`/api/devices/device/${id_device}`);
        const device = deviceResp.data;
        if (device && device.id_patient) {
          // 2. Fetch patient by id_patient
          const patient = await fetchPatientByIdPatient(device.id_patient);
          if (isMounted) {
            setPatientName(patient.name);
            setPatientId(patient.id_patient);
          }
        } else {
          if (isMounted) {
            setPatientName(null);
            setPatientId(null);
          }
        }
      } catch {
        if (isMounted) {
          setPatientName(null);
          setPatientId(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchPatientName();
    return () => {
      isMounted = false;
    };
  }, [id_device, patient_name]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    return status === "open" ? "text-red-500" : "text-green-500";
  };

  const translateStatus = (status: string) => {
    return status === "open" ? "Otevřený" : "Vyřešený";
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
                {loading
                  ? "Loading..."
                  : patient_name || patientName
                    ? `${patient_name || patientName}`
                    : `Device ID: ${id_device}`}
              </h3>
              {room && (
                <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Room: {room}
                </p>
              )}
            </div>
            <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(status)}`}>
              {translateStatus(status)}
            </span>
          </div>

          <div className="mt-4">
            <h4
              className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Historie:
            </h4>
            <div className="space-y-2">
              {history.map((entry, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className={getStatusColor(entry.status)}>
                    {translateStatus(entry.status)}
                  </span>
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
