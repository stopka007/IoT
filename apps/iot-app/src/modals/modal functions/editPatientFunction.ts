import { useEffect, useState } from "react";

import apiClient from "../../api/axiosConfig";

export interface Room {
  id: string;
  name: number;
}

export interface Patient {
  id: string;
  id_patient: string;
  name: string;
  room: number;
  illness?: string;
  age?: number;
  status?: string;
  notes?: string;
  id_device?: string;
}

export interface UseEditPatientLogic {
  rooms: Room[];
  patientName: string;
  setPatientName: (value: string) => void;
  selectedRoom: number;
  setSelectedRoom: (value: number) => void;
  illness: string;
  setIllness: (value: string) => void;
  age: string;
  setAge: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useEditPatientLogic = (
  isOpen: boolean,
  onClose: () => void,
  patientId: string,
): UseEditPatientLogic => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patientName, setPatientName] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<number>(0);
  const [illness, setIllness] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalPatientName, setOriginalPatientName] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [roomsResponse, patientResponse] = await Promise.all([
          apiClient.get<{ data: Room[] }>("/api/rooms"),
          apiClient.get<Patient>(`/api/patients/${patientId}`),
        ]);

        if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
          setRooms(roomsResponse.data);
        } else if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
          setRooms(roomsResponse.data.data);
        }

        // Set patient data
        if (patientResponse.data) {
          setPatientName(patientResponse.data.name);
          setOriginalPatientName(patientResponse.data.name);
          setSelectedRoom(patientResponse.data.room);
          setIllness(patientResponse.data.illness || "");
          setAge(patientResponse.data.age?.toString() || "");
          setNotes(patientResponse.data.notes || "");
          setStatus(patientResponse.data.status || "");
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
  }, [isOpen, patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName || !selectedRoom) {
      setError("Patient name and room are required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First, get the patient's current data to check if they have a device
      const patientResponse = await apiClient.get<Patient>(`/api/patients/${patientId}`);
      const patient = patientResponse.data;
      const hasDevice = patient.id_device && patient.id_device.trim() !== "";

      // Update the patient
      const response = await apiClient.patch(`/api/patients/${patientId}`, {
        name: patientName,
        room: Number(selectedRoom),
        illness: illness || undefined,
        age: age ? Number(age) : undefined,
        status: status || undefined,
        notes: notes || undefined,
      });

      if (response.status === 200) {
        // If patient has a device and name was changed, update the device properties
        if (hasDevice && patientName !== originalPatientName) {
          try {
            await apiClient.patch(`/api/devices/device/${patient.id_device}`, {
              patient_name: patientName,
            });
          } catch (deviceErr) {
            console.error("Failed to update device properties:", deviceErr);
            // Don't throw error here, as patient was already updated successfully
          }
        }
        onClose(); // This will trigger the onUpdate callback in PatientDetailsModal
      } else {
        setError("Failed to update patient: " + response.statusText);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to update patient");
      } else {
        setError("Failed to update patient: " + String(err));
      }
      console.error("Error updating patient:", err);
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
    status,
    setStatus,
    notes,
    setNotes,
    isLoading,
    error,
    handleSubmit,
  };
};
