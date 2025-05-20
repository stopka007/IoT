import { useState } from "react";

import DeviceIcon from "../../Icons/DeviceIcon";
import { useAuth } from "../../authentication/context/AuthContext";
import { useTheme } from "../../functions/ThemeContext";
import DeleteDeviceModal from "../../modals/deleteDeviceModal";

const DeleteDeviceComponent = () => {
  const { theme } = useTheme();
  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const [showDeleteDeviceModal, setShowDeleteDeviceModal] = useState(false);
  const { user } = useAuth();

  return (
    user?.role === "admin" && (
      <div
        className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-lg hover:shadow-neutral-500/50 dark:hover:shadow-black/50 transition duration-300 ease-in-out`}
      >
        <span className="flex items-center justify-center text-2xl">Smazat zařízení</span>
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={() => setShowDeleteDeviceModal(true)}
            className="border-2 rounded-full p-2 hover:shadow-2xl transform duration-300 shadow-black text-red-600 cursor-pointer"
            title="Smazat zařízení"
          >
            <DeviceIcon />
          </button>
        </div>
        <DeleteDeviceModal
          isOpen={showDeleteDeviceModal}
          onClose={() => setShowDeleteDeviceModal(false)}
          theme={theme}
        />
      </div>
    )
  );
};

export default DeleteDeviceComponent;
