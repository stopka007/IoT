interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  theme: string;
}

export default function LogoutModal({ isOpen, onClose, onLogout, theme }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        className={`${theme === "light" ? "bg-white" : "bg-neutral-800"} rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out scale-100 opacity-100`}
      >
        <h3
          className={`text-lg font-medium ${theme === "light" ? "text-gray-900" : "text-white"} mb-4`}
        >
          Potvrdit Odhlášení
        </h3>
        <p className={`${theme === "light" ? "text-gray-500" : "text-gray-300"} mb-6`}>
          Opravdu se chcete odhlásit?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium ${
              theme === "light"
                ? "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-300"
                : "text-gray-200 bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-500"
            } rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200`}
          >
            Zrušit
          </button>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
          >
            Odhlásit se
          </button>
        </div>
      </div>
    </div>
  );
}
