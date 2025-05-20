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
      setError("Please select a device to delete.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/api/devices/device/${selectedDevice}`);
      triggerUpdate();
      onClose();
    } catch {
      setError("Failed to delete device.");
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
          Delete Device
        </h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <form onSubmit={handleDelete}>
          <div className="space-y-4">
            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Select Device to Delete
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
                <option value="">Select a device...</option>
                {devices.map(device => (
                  <option key={device.id} value={device.id_device}>
                    Device {device.id_device}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium ${
                theme === "light"
                  ? "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-300"
                  : "text-gray-200 bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-500"
              } rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
