interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  theme: string;
  type: "logout" | "delete" | "unassign-device";
  title?: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  theme,
  type,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // Default values based on type
  const defaultTitle =
    type === "logout"
      ? "Potvrdit Odhlášení"
      : type === "delete"
        ? "Potvrdit Smazání"
        : "Potvrdit Odpojení";
  const defaultMessage =
    type === "logout"
      ? "Opravdu se chcete odhlásit?"
      : type === "delete"
        ? "Opravdu chcete smazat tento záznam?"
        : "Opravdu chcete odpojit zařízení od pacienta?";
  const defaultConfirmText =
    type === "logout" ? "Odhlásit se" : type === "delete" ? "Smazat" : "Odpojit";
  const defaultCancelText = "Zrušit";

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        className={`${theme === "light" ? "bg-white" : "bg-neutral-800"} rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out scale-100 opacity-100`}
      >
        <h3
          className={`text-lg font-medium ${theme === "light" ? "text-gray-900" : "text-white"} mb-4`}
        >
          {title || defaultTitle}
        </h3>
        <p className={`${theme === "light" ? "text-gray-500" : "text-gray-300"} mb-6`}>
          {message || defaultMessage}
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium cursor-pointer border ${
              theme === "light"
                ? "text-gray-600 border-gray-300 hover:bg-gray-600 hover:text-white"
                : "text-gray-400 border-gray-600 hover:bg-gray-600 hover:text-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200`}
          >
            {cancelButtonText || defaultCancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium cursor-pointer border ${
              type === "logout"
                ? theme === "light"
                  ? "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  : "text-red-500 border-red-500 hover:bg-red-600 hover:text-white"
                : type === "delete"
                  ? theme === "light"
                    ? "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    : "text-red-500 border-red-500 hover:bg-red-600 hover:text-white"
                  : theme === "light"
                    ? "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    : "text-red-500 border-red-500 hover:bg-red-600 hover:text-white"
            } rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200`}
          >
            {confirmButtonText || defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
