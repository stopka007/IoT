import { useEffect, useState } from "react";

import apiClient from "../../api/axiosConfig";
import { usePatientUpdate } from "../../context/PatientUpdateContext";

export interface Room {
  id: string;
  name: number;
}

export interface UseCreatePatientLogic {
  rooms: Room[];
  patientName: string;
  setPatientName: (value: string) => void;
  selectedRoom: number;
  setSelectedRoom: (value: number) => void;
  illness: string;
  setIllness: (value: string) => void;
  age: string;
  setAge: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export const useCreatePatientLogic = (
  isOpen: boolean,
  onClose: () => void,
): UseCreatePatientLogic => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patientName, setPatientName] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<number>(0);
  const [illness, setIllness] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<string>("Hospitalized");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { triggerUpdate } = usePatientUpdate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const roomsResponse = await apiClient.get<{ data: Room[] }>("/api/rooms");

        if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
          setRooms(roomsResponse.data);
        } else if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
          setRooms(roomsResponse.data.data);
        }
      } catch (err) {
        setError("Failed to fetch rooms");
        console.error("Error fetching rooms:", err);
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
    if (!patientName || !selectedRoom) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post("/api/patients", {
        id_patient: generateId(),
        id_device: "",
        name: patientName,
        room: Number(selectedRoom),
        illness: illness || undefined,
        age: age ? Number(age) : undefined,
        notes: notes || undefined,
        status: status || undefined,
      });

      if (response.status === 201) {
        triggerUpdate();
        onClose();
      } else {
        setError("Failed to create patient");
      }
    } catch (err) {
      setError("Failed to create patient");
      console.error("Error creating patient:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rooms,
    patientName,
    setPatientName,
    selectedRoom,
    setSelectedRoom,
    illness,
    setIllness,
    age,
    setAge,
    notes,
    setNotes,
    status,
    setStatus,
    isLoading,
    error,
    handleSubmit,
  };
};
