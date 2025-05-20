import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";

import ConnectIcon from "../../Icons/ConnectIcon";
import { useTheme } from "../../functions/ThemeContext";
import AssignDeviceModal from "../../modals/assignDeviceModal";

const ConnectDeviceComponent = () => {
  const { theme } = useTheme();
  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const [showAssignDeviceModal, setShowAssignDeviceModal] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);

  const handleUpdate = useCallback(() => {
    setUpdateKey(prev => prev + 1);
  }, []);
  return (
    <>
      <div
        className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-lg hover:shadow-neutral-500/50 dark:hover:shadow-black/50 transition duration-300 ease-in-out`}
      >
        <span className="flex items-center justify-center text-2xl">Přiřadit zařízení</span>
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={() => setShowAssignDeviceModal(true)}
            className="border-2 rounded-full p-2 hover:shadow-2xl transform duration-300 shadow-black text-blue-500"
          >
            <ConnectIcon />
          </button>
        </div>
        <AssignDeviceModal
          isOpen={showAssignDeviceModal}
          onClose={() => setShowAssignDeviceModal(false)}
          theme={theme}
          onUpdate={handleUpdate}
        />
      </div>
      <Outlet context={{ onUpdate: handleUpdate, key: updateKey }} />
    </>
  );
};
export default ConnectDeviceComponent;
