import { useEffect, useState } from "react";

import apiClient from "../../api/axiosConfig";
import { usePatientUpdate } from "../../context/PatientUpdateContext";

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
  initialRoom?: number | null,
): UseAssignRoomLogic => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(initialRoom || null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { triggerUpdate } = usePatientUpdate();

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

  useEffect(() => {
    if (initialRoom && selectedRoom === null) {
      setSelectedRoom(initialRoom);
    }
  }, [initialRoom, selectedRoom, setSelectedRoom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedRoom) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch the current number of patients in the selected room
      const patientsResponse = await apiClient.get<{ data: Patient[] }>("/api/patients");
      const currentPatientsInRoom = patientsResponse.data.data.filter(
        (patient: Patient) => patient.room === selectedRoom,
      ).length;

      // Fetch the room details to get its capacity
      const roomResponse = await apiClient.get<{ data: Room[] }>("/api/rooms");
      const roomDetails = roomResponse.data.data.find((room: Room) => room.name === selectedRoom);

      if (roomDetails && currentPatientsInRoom >= roomDetails.capacity) {
        setError("The selected room is full. Please choose another room.");
        return;
      }

      const response = await apiClient.patch(`/api/patients/${selectedPatient}`, {
        room: Number(selectedRoom),
      });

      if (response.status === 200) {
        // Reset form state
        setSelectedPatient("");
        setSelectedRoom(null);
        triggerUpdate();
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
