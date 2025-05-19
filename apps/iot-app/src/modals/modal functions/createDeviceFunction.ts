import { useEffect, useState } from "react";

import apiClient from "../../api/axiosConfig";
import { usePatientUpdate } from "../../context/PatientUpdateContext";

export interface Patient {
  id: string;
  name: string;
  room?: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface UseCreateDeviceLogic {
  patients: Patient[];
  rooms: Room[];
  selectedPatient: string;
  setSelectedPatient: (value: string) => void;
  selectedRoom: string;
  setSelectedRoom: (value: string) => void;
  deviceId: string;
  setDeviceId: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useCreateDeviceLogic = (
  isOpen: boolean,
  onClose: () => void,
): UseCreateDeviceLogic => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { triggerUpdate } = usePatientUpdate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [patientsResponse, roomsResponse] = await Promise.all([
          apiClient.get<{ data: Patient[] }>("/api/patients"),
          apiClient.get<{ data: Room[] }>("/api/rooms"),
        ]);

        if (patientsResponse.data && Array.isArray(patientsResponse.data)) {
          setPatients(patientsResponse.data);
        } else if (patientsResponse.data.data && Array.isArray(patientsResponse.data.data)) {
          setPatients(patientsResponse.data.data);
        } else {
          console.error("Unexpected patients data format:", patientsResponse.data);
          setError("Invalid patients data format received");
        }

        if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
          setRooms(roomsResponse.data);
        } else if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
          setRooms(roomsResponse.data.data);
        } else {
          console.error("Unexpected rooms data format:", roomsResponse.data);
          setError("Invalid rooms data format received");
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
    if (!deviceId) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post("/api/devices", {
        id_device: deviceId,
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
    patients,
    rooms,
    selectedPatient,
    setSelectedPatient,
    selectedRoom,
    setSelectedRoom,
    deviceId,
    setDeviceId,
    isLoading,
    error,
    handleSubmit,
  };
};
