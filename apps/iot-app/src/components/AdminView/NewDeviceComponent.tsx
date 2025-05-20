import { useState } from "react";
import { Outlet } from "react-router-dom";

import DeviceIcon from "../../Icons/DeviceIcon";
import { useTheme } from "../../functions/ThemeContext";
import CreateDeviceModal from "../../modals/createDeviceModal";
import DeleteDeviceModal from "../../modals/deleteDeviceModal";

const NewDeviceComponent = () => {
  const { theme } = useTheme();
  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const [showCreateDeviceModal, setShowCreateDeviceModal] = useState(false);
  const [showDeleteDeviceModal, setShowDeleteDeviceModal] = useState(false);

  return (
    <>
      <div
        className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-lg hover:shadow-neutral-500/50 dark:hover:shadow-black/50 transition duration-300 ease-in-out`}
      >
        <span className="flex items-center justify-center text-2xl">Přidat zařízení</span>
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={() => setShowCreateDeviceModal(true)}
            className="border-2 rounded-full p-2 hover:shadow-2xl transform duration-300 shadow-black text-green-500"
          >
            <DeviceIcon />
          </button>
        </div>
        <CreateDeviceModal
          isOpen={showCreateDeviceModal}
          onClose={() => setShowCreateDeviceModal(false)}
          theme={theme}
        />
        <DeleteDeviceModal
          isOpen={showDeleteDeviceModal}
          onClose={() => setShowDeleteDeviceModal(false)}
          theme={theme}
        />
      </div>
      <Outlet />
    </>
  );
};
export default NewDeviceComponent;
