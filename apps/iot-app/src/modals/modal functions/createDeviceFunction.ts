import { useState } from "react";

import apiClient from "../../api/axiosConfig";
import { usePatientUpdate } from "../../context/PatientUpdateContext";

export interface UseCreateDeviceLogic {
  battery_level: number | null;
  setBattery_level: (value: number | null) => void;
  deviceId: string;
  setDeviceId: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useCreateDeviceLogic = (onClose: () => void): UseCreateDeviceLogic => {
  const [deviceId, setDeviceId] = useState<string>("");
  const [battery_level, setBattery_level] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { triggerUpdate } = usePatientUpdate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post("/api/devices", {
        id_device: deviceId,
        battery_level: battery_level || 0,
      });

      if (response.status === 201) {
        triggerUpdate();
        onClose();
      } else {
        setError("Failed to create device");
      }
    } catch (err) {
      setError("Failed to create device");
      console.error("Error creating device:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deviceId,
    setDeviceId,
    isLoading,
    error,
    handleSubmit,
    battery_level,
    setBattery_level,
  };
};
