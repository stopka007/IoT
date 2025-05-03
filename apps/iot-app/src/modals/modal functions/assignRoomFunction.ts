import { useEffect, useState } from "react";

import apiClient from "../../api/axiosConfig";

interface Room {
  id: string;
  name: number;
  capacity: number;
}

interface Patient {
  _id: string;
  name: string;
  room?: number;
}

export interface UseAssignRoomLogic {
  rooms: Room[];
  patients: Patient[];
  selectedRoom: number | null;
  setSelectedRoom: (value: number | null) => void;
  selectedPatient: string;
  setSelectedPatient: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useAssignRoomLogic = (
  isOpen: boolean,
  onClose: () => void,
  onUpdate?: () => void,
): UseAssignRoomLogic => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [roomsResponse, patientsResponse] = await Promise.all([
          apiClient.get<{ data: Room[] }>("/api/rooms"),
          apiClient.get<{ data: Patient[] }>("/api/patients"),
        ]);

        if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
          setRooms(roomsResponse.data);
        } else if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
          setRooms(roomsResponse.data.data);
        }

        if (patientsResponse.data && Array.isArray(patientsResponse.data)) {
          setPatients(patientsResponse.data);
        } else if (patientsResponse.data.data && Array.isArray(patientsResponse.data.data)) {
          setPatients(patientsResponse.data.data);
        }
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedRoom) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.patch(`/api/patients/${selectedPatient}`, {
        room: Number(selectedRoom),
      });

      if (response.status === 200) {
        // Reset form state
        setSelectedPatient("");
        setSelectedRoom(null);

        // Call onUpdate before closing the modal
        if (onUpdate) {
          onUpdate();
        }
        onClose();
      } else {
        setError("Failed to assign room");
      }
    } catch (err) {
      setError("Failed to assign room");
      console.error("Error assigning room:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rooms,
    patients,
    selectedRoom,
    setSelectedRoom,
    selectedPatient,
    setSelectedPatient,
    isLoading,
    error,
    handleSubmit,
  };
};
