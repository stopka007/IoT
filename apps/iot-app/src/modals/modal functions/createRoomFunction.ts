import { useState } from "react";

import apiClient from "../../api/axiosConfig";

export interface UseCreateRoomLogic {
  roomNumber: string;
  setRoomNumber: (value: string) => void;
  capacity: string;
  setCapacity: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useCreateRoomLogic = (
  isOpen: boolean,
  onClose: () => void,
  onUpdate?: () => void,
): UseCreateRoomLogic => {
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !capacity) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post("/api/rooms", {
        name: Number(roomNumber),
        capacity: Number(capacity),
      });

      if (response.status === 201) {
        if (onUpdate) {
          onUpdate();
        }
        onClose();
      } else {
        setError("Failed to create room");
      }
    } catch (err) {
      setError("Failed to create room");
      console.error("Error creating room:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    roomNumber,
    setRoomNumber,
    capacity,
    setCapacity,
    isLoading,
    error,
    handleSubmit,
  };
};
