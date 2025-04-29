import React, { useCallback, useEffect, useState } from "react";

import apiClient from "../api/axiosConfig";

interface BatteryResponse {
  battery_level: number;
  id_device: string;
}

interface BatteryProps {
  deviceId: string;
  onBatteryUpdate?: (level: number) => void;
}

const getBatteryColor = (level: number): string => {
  if (level < 10) return "bg-red-500 animate-pulse";
  if (level < 20) return "bg-red-500";
  if (level < 50) return "bg-yellow-400";
  if (level < 80) return "bg-green-400";
  return "bg-green-600";
};

const getGlowColor = (level: number): string => {
  if (level < 20) return "0 0 8px 4px rgba(239, 68, 68, 0.6)";
  if (level < 50) return "0 0 8px 4px rgba(250, 204, 21, 0.6)";
  if (level < 80) return "0 0 8px 4px rgba(74, 222, 128, 0.6)";
  return "0 0 8px 4px rgba(22, 163, 74, 0.6)";
};

export const getBatteryLevel = async (id_device: string): Promise<BatteryResponse> => {
  try {
    console.log("Fetching battery for device:", id_device);
    const response = await apiClient.get<BatteryResponse>(`/api/devices/battery/${id_device}`);
    console.log("Battery response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching battery level for device ${id_device}:`, error);
    throw error;
  }
};

export const Battery: React.FC<BatteryProps> = ({ deviceId, onBatteryUpdate }) => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBattery = useCallback(async () => {
    if (!deviceId) {
      console.log("No device ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching battery for:", deviceId);
      const response = await getBatteryLevel(deviceId);

      if (typeof response.battery_level === "number") {
        console.log("Setting battery level to:", response.battery_level);
        setBatteryLevel(response.battery_level);
        onBatteryUpdate?.(response.battery_level);
      } else {
        console.error("Invalid battery level received:", response);
        setError("Invalid battery data received");
      }
    } catch (err) {
      setError("Failed to fetch battery level");
      console.error("Battery fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [deviceId, onBatteryUpdate]);

  useEffect(() => {
    fetchBattery();
  }, [fetchBattery]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (batteryLevel === null) {
    return <div>No battery data</div>;
  }

  const glow = getGlowColor(batteryLevel);
  const batteryColor = getBatteryColor(batteryLevel);

  return (
    <div className="flex items-center">
      <div
        className="relative w-14 h-6 border-2 border-neutral-800 rounded-sm overflow-hidden text-white text-[10px] font-bold flex items-center justify-center bg-neutral-600 transition duration-300 hover:border-1"
        style={{
          boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = glow;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 rgba(0, 0, 0, 0)";
        }}
      >
        <div
          className={`${batteryColor} absolute top-0 left-0 h-full`}
          style={{ width: `${batteryLevel}%` }}
        />
        <span className="z-10">{batteryLevel}%</span>
        <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-1.5 h-3 bg-neutral-600 rounded-sm" />
      </div>
      <div className="w-1 h-2 bg-neutral-800 rounded-sm" />
    </div>
  );
};
