import { useAssignRoomLogic } from "./modal functions/assignRoomFunction";

interface AssignRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  initialRoom: number | null;
}

export default function AssignRoomModal({
  isOpen,
  onClose,
  theme,
  initialRoom,
}: AssignRoomModalProps) {
  const {
    rooms,
    patients,
    selectedRoom,
    setSelectedRoom,
    selectedPatient,
    setSelectedPatient,
    isLoading,
    error,
    handleSubmit,
  } = useAssignRoomLogic(isOpen, onClose, initialRoom);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        className={`${theme === "light" ? "bg-white" : "bg-neutral-800"} rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}
        >
          Přiřadit pokoj pacientovi
        </h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
              >
                Pacient *
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
                <option value="">Vyberte pacienta</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}{" "}
                    {patient.room ? `(Aktuální Pokoj: ${patient.room})` : "(Žádný Pokoj)"}
                  </option>
                ))}
              </select>
            </div>

            {!initialRoom && (
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
                >
                  Pokoj *
                </label>
                <select
                  value={selectedRoom || ""}
                  onChange={e => setSelectedRoom(parseInt(e.target.value))}
                  className={`w-full p-2 border rounded-md ${
                    theme === "light"
                      ? "bg-white border-gray-300 text-gray-900"
                      : "bg-neutral-700 border-neutral-600 text-white"
                  }`}
                  disabled={isLoading}
                  required
                >
                  <option value="">Vyberte pokoj...</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.name}>
                      Pokoj {room.name} (Kapacita: {room.capacity})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              Zrušit
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Přiřazuji..." : "Přiřadit Pokoj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
