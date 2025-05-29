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
                {Array.isArray(patients) && patients.length > 0 ? (
                  patients.map(patient => (
                    <option key={patient.id} value={patient._id}>
                      {patient.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No unassigned patients available
                  </option>
                )}
              </select>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium cursor-pointer border ${
                  theme === "light"
                    ? "text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                    : "text-blue-500 border-blue-500 hover:bg-blue-600 hover:text-white"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50`}
                disabled={isLoading || devices.length === 0}
              >
                {isLoading ? "Přiřazuji..." : "Přiřadit Zařízení"}
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
