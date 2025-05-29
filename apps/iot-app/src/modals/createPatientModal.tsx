import { useCreatePatientLogic } from "./modal functions/createPatientFunction";

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

export default function CreatePatientModal({ isOpen, onClose, theme }: CreatePatientModalProps) {
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
    notes,
    setNotes,
    isLoading,
    error,
    handleSubmit,
  } = useCreatePatientLogic(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        className={`${theme === "light" ? "bg-white" : "bg-neutral-800"} rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}
        >
          Přidat Nového Pacienta
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
                Pokoj
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
                placeholder="Zadejte nemoc (volitelně)"
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
                placeholder="Zadejte věk (volitelně)"
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
                Poznámky
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Zadejte poznámky (volitelně)"
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

          <div className="mt-6 flex justify-between">
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium cursor-pointer border ${
                  theme === "light"
                    ? "text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                    : "text-green-500 border-green-500 hover:bg-green-600 hover:text-white"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50`}
                disabled={isLoading}
              >
                {isLoading ? "Vytvářím..." : "Vytvořit Pacienta"}
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
