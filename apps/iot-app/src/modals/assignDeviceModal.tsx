import { useEffect } from "react";

import { useAssignDeviceLogic } from "./modal functions/assignDeviceFunction";

interface AssignDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  initialPatient?: string;
}

export default function AssignDeviceModal({
  isOpen,
  onClose,
  theme,
  initialPatient,
}: AssignDeviceModalProps) {
  const {
    patients,
    devices,
    selectedPatient,
    setSelectedPatient,
    selectedDevice,
    setSelectedDevice,
    isLoading,
    error,
    handleSubmit,
  } = useAssignDeviceLogic(isOpen, onClose);

  useEffect(() => {
    if (initialPatient) {
      setSelectedPatient(initialPatient);
    }
  }, [initialPatient, setSelectedPatient]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        className={`${theme === "light" ? "bg-white" : "bg-neutral-800"} rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}
        >
          Přiřadit Existující Zařízení
        </h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
            >
              Vyberte Zařízení
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
              {Array.isArray(devices) && devices.length > 0 ? (
                devices.map(device => (
                  <option key={device.id} value={device.id_device}>
                    Device {device.id_device}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Žádné nepřiřazené zařízení k dispozici
                </option>
              )}
            </select>
          </div>

          {!initialPatient && (
            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Vyberte Pacienta
              </label>
              <select
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-neutral-700 border-neutral-600 text-white"
                }`}
                disabled={isLoading}
                required
              >
                <option value="">Vyberte pacienta...</option>
                {Array.isArray(patients) &&
                  patients.map(patient => (
                    <option key={patient.id} value={patient._id}>
                      {patient.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                theme === "light"
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-neutral-600 text-white hover:bg-neutral-500"
              }`}
              disabled={isLoading}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading || devices.length === 0}
            >
              {isLoading ? "Přiřazuji..." : "Přiřadit Zařízení"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
