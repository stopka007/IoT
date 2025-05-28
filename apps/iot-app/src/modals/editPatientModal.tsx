import { useState } from "react";
import { toast } from "react-hot-toast";

import apiClient from "../api/axiosConfig";
import { usePatientUpdate } from "../context/PatientUpdateContext";

import { useEditPatientLogic } from "./modal functions/editPatientFunction";

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  patientId: string;
}

export default function EditPatientModal({
  isOpen,
  onClose,
  theme,
  patientId,
}: EditPatientModalProps) {
  const {
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
  } = useEditPatientLogic(isOpen, onClose, patientId);

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const { triggerUpdate } = usePatientUpdate();

  if (!isOpen) return null;

  // Archive logic
  const handleArchive = async () => {
    setArchiveLoading(true);
    setArchiveError(null);
    try {
      // First update patient with current form values including status
      await apiClient.patch(`/api/patients/${patientId}`, {
        name: patientName,
        room: Number(selectedRoom),
        illness: illness || undefined,
        age: age ? Number(age) : undefined,
        status: status || undefined,
        notes: notes || undefined,
      });

      // Use the server's archive endpoint
      await apiClient.post(`/api/patients/${patientId}/archive`);

      // Close modal and refresh UI
      onClose();
      triggerUpdate();
      toast.success("Pacient byl úspěšně archivován");
    } catch (err: unknown) {
      console.error("Archive error:", err);
      setArchiveError("Nepodařilo se archivovat pacienta");
    } finally {
      setArchiveLoading(false);
      setShowArchiveConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        className={`${theme === "light" ? "bg-white" : "bg-neutral-800"} rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}
        >
          Upravit Pacienta
        </h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Jméno Pacienta *
              </label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Zadejte jméno pacienta"
                className={`w-full p-2 border rounded-md ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-neutral-700 border-neutral-600 text-white"
                }`}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Pokoj *
              </label>
              <select
                value={selectedRoom}
                onChange={e => setSelectedRoom(Number(e.target.value))}
                className={`w-full p-2 border rounded-md ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-neutral-700 border-neutral-600 text-white"
                }`}
                disabled={isLoading}
                required
              >
                <option value="0">Vyberte pokoj...</option>
                {Array.isArray(rooms) &&
                  rooms.map(room => (
                    <option key={room.id} value={room.name}>
                      {room.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Nemoc
              </label>
              <input
                type="text"
                value={illness}
                onChange={e => setIllness(e.target.value)}
                placeholder="Zadejte nemoc (volitelné)"
                className={`w-full p-2 border rounded-md ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-neutral-700 border-neutral-600 text-white"
                }`}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Věk
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="Zadejte věk (volitelné)"
                className={`w-full p-2 border rounded-md ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-neutral-700 border-neutral-600 text-white"
                }`}
                disabled={isLoading}
                min="0"
                max="150"
              />
            </div>

            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Stav
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-neutral-700 border-neutral-600 text-white"
                }`}
                disabled={isLoading}
              >
                <option value="Released">Propuštěn</option>
                <option value="Deceased">Zemřel</option>
              </select>
            </div>

            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Poznámky
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Zadejte poznámky (volitelné)"
                className={`w-full p-2 border rounded-md ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-neutral-700 border-neutral-600 text-white"
                }`}
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-between mt-6 flex-wrap gap-0.5 py-0.5 overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowArchiveConfirm(true)}
              className="mr-15 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
              disabled={isLoading || archiveLoading}
            >
              {archiveLoading ? "Archivuji..." : "Archivovat"}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
              disabled={isLoading || archiveLoading}
            >
              {isLoading ? "Aktualizuji..." : "Aktualizovat Pacienta"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium cursor-pointer ${
                theme === "light"
                  ? "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-300"
                  : "text-gray-200 bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-500"
              } rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200`}
              disabled={isLoading || archiveLoading}
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>

      {/* Archive confirmation dialog */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div
            className={`${theme === "light" ? "bg-white" : "bg-neutral-800"} rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out`}
          >
            <h3 className="text-lg font-semibold mb-4">Archivovat Pacienta?</h3>
            <p className="mb-4">
              Opravdu chcete archivovat tohoto pacienta? Tato akce přesune pacienta do archivu a
              odstraní ho z aktivního seznamu.
            </p>

            <div className="mb-4">
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Stav pacienta
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-neutral-700 border-neutral-600 text-white"
                }`}
                disabled={archiveLoading}
              >
                <option value="Released">Propuštěn</option>
                <option value="Deceased">Zemřel</option>
              </select>
            </div>

            {archiveError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{archiveError}</div>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleArchive}
                className={`px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-200 cursor-pointer`}
                disabled={archiveLoading}
              >
                {archiveLoading ? "Archivuji..." : "Ano, Archivovat"}
              </button>
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className={`px-4 py-2 text-sm font-medium cursor-pointer ${
                  theme === "light"
                    ? "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-300"
                    : "text-gray-200 bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-500"
                } rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200`}
                disabled={archiveLoading}
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
