import { useEffect, useState } from "react";

import apiClient from "../../api/axiosConfig";
import { usePatientUpdate } from "../../context/PatientUpdateContext";

export interface Patient {
  _id: string;
  id: string;
  id_patient: string;
  name: string;
  room: number;
  illness?: string;
  age?: number;
  notes?: string;
  id_device?: string;
}

export interface Device {
  id: string;
  id_device: string;
  room?: number;
  id_patient?: string;
  patient_name?: string;
}

export interface UseAssignDeviceLogic {
  patients: Patient[];
  devices: Device[];
  selectedPatient: string;
  setSelectedPatient: (value: string) => void;
  selectedDevice: string;
  setSelectedDevice: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useAssignDeviceLogic = (
  isOpen: boolean,
  onClose: () => void,
): UseAssignDeviceLogic => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { triggerUpdate } = usePatientUpdate();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [patientsResponse, devicesResponse] = await Promise.all([
        apiClient.get<{ data: Patient[] }>("/api/patients"),
        apiClient.get<{ data: Device[] }>("/api/devices"),
      ]);

      // Handle patients response
      const patientsList = patientsResponse.data.data || patientsResponse.data;
      if (Array.isArray(patientsList)) {
        setPatients(patientsList);
      } else {
        console.error("Unexpected patients data format:", patientsList);
        setError("Invalid patients data format received");
      }

      // Handle devices response - devices are returned directly as an array
      const devicesList = devicesResponse.data.data || devicesResponse.data;
      if (Array.isArray(devicesList)) {
        // Filter out devices that are already assigned to patients
        const unassignedDevices = devicesList.filter(device => !device.id_patient);
        setDevices(unassignedDevices);
      } else {
        console.error("Unexpected devices data format:", devicesList);
        setError("Invalid devices data format received");
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedDevice) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Find the device using id_device instead of MongoDB id
      const device = devices.find(d => d.id_device === selectedDevice);
      if (!device) {
        setError("Selected device not found");
        return;
      }

      // Find the selected patient using MongoDB _id
      const patient = patients.find(p => p._id === selectedPatient);
      if (!patient) {
        setError("Selected patient not found");
        return;
      }

      try {
        // Update both the device and patient
        await Promise.all([
          // Update the device
          apiClient.patch(`/api/devices/device/${device.id_device}`, {
            id_patient: patient.id_patient,
            patient_name: patient.name,
            room: patient.room ? Number(patient.room) : undefined,
          }),
          // Update the patient using MongoDB _id
          apiClient.patch(`/api/patients/${patient._id}`, {
            id_device: device.id_device,
          }),
        ]);

        // Reset form
        setSelectedPatient("");
        setSelectedDevice("");

        // Trigger global update
        triggerUpdate();
        // Close modal
        onClose();
      } catch (err) {
        console.error("Error assigning device:", err);
        setError("Failed to assign device");
      } finally {
        setIsLoading(false);
      }
    } catch (err) {
      setError("Failed to assign device");
      console.error("Error assigning device:", err);
    }
  };

  return {
    patients,
    devices,
    selectedPatient,
    setSelectedPatient,
    selectedDevice,
    setSelectedDevice,
    isLoading,
    error,
    handleSubmit,
  };
};
