import { useState } from "react";
import { Outlet } from "react-router-dom";

import ArrowLeftRightIcon from "../../Icons/ArrowLeftRightIcon";
import BiggerHomeIcon from "../../Icons/BiggerHomeIcon";
import BiggerPersonIcon from "../../Icons/BiggerUserIcon";
import { usePatientUpdate } from "../../context/PatientUpdateContext";
import { useTheme } from "../../functions/ThemeContext";
import AssignRoomModal from "../../modals/assignRoomModal";

// Define the props interface with optional props
interface ConnectPacientRoomComponentProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ConnectPacientRoomComponent: React.FC<ConnectPacientRoomComponentProps> = ({
  isOpen = false,
  onClose = () => {},
}) => {
  const { theme } = useTheme();
  const { triggerUpdate } = usePatientUpdate();
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(isOpen);

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";

  return (
    <>
      <div
        className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-lg hover:shadow-neutral-500/50 dark:hover:shadow-black/50 transition duration-300 ease-in-out`}
      >
        <span className="flex items-center justify-center text-2xl">
          Přiřadit pacienta do pokoje
        </span>
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={() => {
              setShowAssignRoomModal(true);
            }}
            className="border-2 rounded-full p-2 hover:shadow-2xl transform duration-300 shadow-black text-blue-500 cursor-pointer"
          >
            <div className="flex justify-center items-center px-1">
              <BiggerHomeIcon />
              <ArrowLeftRightIcon />
              <BiggerPersonIcon />
            </div>
          </button>
        </div>
      </div>

      <AssignRoomModal
        isOpen={showAssignRoomModal}
        onClose={() => {
          setShowAssignRoomModal(false);
          onClose(); // Call the passed onClose function
          triggerUpdate();
        }}
        theme={theme}
        initialRoom={null}
      />

      <Outlet />
    </>
  );
};

export default ConnectPacientRoomComponent;
