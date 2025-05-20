import { useState } from "react";
import { Outlet } from "react-router-dom";

import AddUserIcon from "../../Icons/AddUserIcon";
import { usePatientUpdate } from "../../context/PatientUpdateContext";
import { useTheme } from "../../functions/ThemeContext";
import CreatePatientModal from "../../modals/createPatientModal";

const NewPacientComponent = () => {
  const { theme } = useTheme();
  const { triggerUpdate } = usePatientUpdate();
  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const [showCreatePatientModal, setShowCreatePatientModal] = useState(false);

  return (
    <>
      <div
        className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-lg hover:shadow-neutral-500/50 dark:hover:shadow-black/50 transition duration-300 ease-in-out`}
      >
        <span className="flex items-center justify-center text-2xl">Přidat pacienta</span>

        <div className="flex items-center justify-center flex-1">
          <button
            onClick={() => setShowCreatePatientModal(true)}
            className="border-2 rounded-full p-2 hover:shadow-2xl transform duration-300 shadow-black text-green-500 cursor-pointer"
          >
            <AddUserIcon />
          </button>
        </div>
        <CreatePatientModal
          isOpen={showCreatePatientModal}
          onClose={() => setShowCreatePatientModal(false)}
          theme={theme}
          onUpdate={triggerUpdate}
        />
      </div>
      <Outlet />
    </>
  );
};
export default NewPacientComponent;
