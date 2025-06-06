import { useEffect, useState } from "react";

import apiClient from "../api/axiosConfig";
import { usePatientUpdate } from "../context/PatientUpdateContext";

interface Device {
  id: string;
  id_device: string;
  room?: number;
  id_patient?: string;
  patient_name?: string;
}

interface Patient {
  _id: string;
  id_patient: string;
  id_device?: string;
}

interface DeleteDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

export default function DeleteDeviceModal({ isOpen, onClose, theme }: DeleteDeviceModalProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { triggerUpdate } = usePatientUpdate();

  useEffect(() => {
    if (isOpen) {
      setSelectedDevice("");
      setError(null);
      setIsLoading(false);
      apiClient
        .get<{ data: Device[] }>("/api/devices")
        .then(res => {
          setDevices(res.data.data || res.data);
        })
        .catch(() => setDevices([]));
    }
  }, [isOpen]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) {
      setError("Vyberte zařízení k odstranění.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Get the device to check if it's assigned to a patient
      const selectedDeviceObj = devices.find(d => d.id_device === selectedDevice);

      if (selectedDeviceObj && selectedDeviceObj.id_patient) {
        // First get the associated patient
        const patientsResponse = await apiClient.get<{ data: Patient[] }>("/api/patients");
        const patients = patientsResponse.data.data || patientsResponse.data;

        // Find patient with matching id_patient
        const associatedPatient = patients.find(p => p.id_patient === selectedDeviceObj.id_patient);

        if (associatedPatient) {
          // Clear the id_device from the patient
          await apiClient.patch(`/api/patients/${associatedPatient._id}`, {
            id_device: null,
          });
        }
      }

      // Delete the device
      await apiClient.delete(`/api/devices/device/${selectedDevice}`);
      triggerUpdate();
      onClose();
    } catch (err) {
      console.error("Error deleting device:", err);
      setError("Nepodařilo se odstranit zařízení.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        className={`${theme === "light" ? "bg-white" : "bg-neutral-800"} rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}
        >
          Odstranit Zařízení
        </h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <form onSubmit={handleDelete}>
          <div className="space-y-4">
            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Vyberte zařízení k odstranění
              </label>
              <select
                value={selectedDevice}
                onChange={e => setSelectedDevice(e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-neutral-700 border-neutral-600 text-white"
                }`}
                disabled={isLoading}
                required
              >
                <option value="">Vyberte zařízení...</option>
                {devices.map(device => (
                  <option key={device.id} value={device.id_device}>
                    Zařízení {device.id_device}
                    {device.patient_name ? ` (přiřazeno ${device.patient_name})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium cursor-pointer border ${
                  theme === "light"
                    ? "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    : "text-red-500 border-red-500 hover:bg-red-600 hover:text-white"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50`}
                disabled={isLoading}
              >
                {isLoading ? "Odstraňuji..." : "Odstranit Zařízení"}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium cursor-pointer border ${
                  theme === "light"
                    ? "text-gray-600 border-gray-300 hover:bg-gray-600 hover:text-white"
                    : "text-gray-400 border-gray-600 hover:bg-gray-600 hover:text-white"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200`}
                disabled={isLoading}
              >
                Zrušit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
