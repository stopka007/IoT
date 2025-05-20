import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import HomeIcon from "../../Icons/HomeIcon";
import MessageSquareIcon from "../../Icons/MessageSquareIcon";
import PersonIcon from "../../Icons/UserIcon";
import { usePatientModal } from "../../context/PatientModalContext";
import { useTheme } from "../../functions/ThemeContext";
import { Patient } from "../../functions/patientService";

interface RoomsComponentProps {
  title: string;
  message?: string;
  patients: Patient[];
  setShowFilter?: (show: boolean) => void;
}

const RoomsComponent: React.FC<RoomsComponentProps> = ({
  title,
  patients,
  message,
  setShowFilter,
}) => {
  const { theme } = useTheme();
  const { openDetailsModal } = usePatientModal();
  const navigate = useNavigate();
  const location = useLocation();

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-300" : "hover:bg-neutral-500";
  const hoverText = theme === "light" ? "hover:text-black" : "hover:text-white";

  const handlePatientClick = (patient: Patient) => {
    openDetailsModal(patient);
    const params = new URLSearchParams(location.search);
    params.set("patient", patient._id);
    navigate({ search: params.toString() }, { replace: false });
  };

  const handleRoomClick = () => {
    const roomNumber = title.replace("Pokoj ", ""); // Např. "Pokoj 102" → "102"
    if (setShowFilter) {
      setShowFilter(false);
    }
    navigate(`/room-detail/${roomNumber}`);
  };

  return (
    <div
      className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-lg hover:shadow-neutral-500/50 dark:hover:shadow-black/50 transition duration-300 ease-in-out`}
    >
      <div>
        <div className="flex items-center gap-2 mb-4" onClick={handleRoomClick}>
          <HomeIcon />
          <h2 className={`text-2xl font-bold ${baseText}`}>{title}</h2>
        </div>

        {message && (
          <div className="flex items-center gap-2 mb-4 underline underline-offset-4 decoration-gray-400 dark:decoration-gray-500">
            <MessageSquareIcon />
            <p className={`text-sm font-semibold ${baseText}`}>{message}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ul className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
          {patients.length > 0 ? (
            patients.map(patient => (
              <div
                key={patient._id}
                onClick={() => handlePatientClick(patient)}
                className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition ${hoverBg} ${hoverText}`}
              >
                <PersonIcon />
                <li className="truncate">{patient.name}</li>
              </div>
            ))
          ) : (
            <li className="italic opacity-70">V tomto pokoji nejsou žádní pacienti.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default RoomsComponent;
