import { useState } from "react";
import { Outlet } from "react-router-dom";

import AddHomeIcon from "../../Icons/AddHomeIcon";
import { useAuth } from "../../authentication/context/AuthContext";
import { usePatientUpdate } from "../../context/PatientUpdateContext";
import { useTheme } from "../../functions/ThemeContext";
import CreateRoomModal from "../../modals/createRoomModal";

const NewRoomComponent = () => {
  const { theme } = useTheme();
  const { triggerUpdate } = usePatientUpdate();
  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {user?.role === "admin" && (
        <div
          className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-lg hover:shadow-neutral-500/50 dark:hover:shadow-black/50 transition duration-300 ease-in-out`}
        >
          <span className="flex items-center justify-center text-2xl">Přidat Pokoj</span>

          <div className="flex items-center justify-center flex-1">
            <button
              onClick={() => setShowCreateRoomModal(true)}
              className="border-2 rounded-full p-2 hover:shadow-2xl transform duration-300 shadow-black text-green-500 cursor-pointer"
            >
              <AddHomeIcon />
            </button>
          </div>
          <CreateRoomModal
            isOpen={showCreateRoomModal}
            onClose={() => setShowCreateRoomModal(false)}
            theme={theme}
            onUpdate={triggerUpdate}
          />
        </div>
      )}
      <Outlet />
    </>
  );
};
export default NewRoomComponent;
