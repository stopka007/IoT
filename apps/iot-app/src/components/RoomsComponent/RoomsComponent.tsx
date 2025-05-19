import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import HomeIcon from "../../Icons/HomeIcon";
import MessageSquareIcon from "../../Icons/MessageSquareIcon";
import PersonIcon from "../../Icons/UserIcon";
import { useTheme } from "../../functions/ThemeContext";
import { Patient } from "../../functions/patientService";
import PatientDetailsModal from "../../modals/PatientDetailsModal";

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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-300" : "hover:bg-neutral-500";
  const hoverText = theme === "light" ? "hover:text-black" : "hover:text-white";

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleRoomClick = () => {
    const roomNumber = title.replace("Pokoj ", ""); // Např. "Pokoj 102" → "102"
    if (setShowFilter) {
      setShowFilter(false);
    }
    navigate(`/room-detail/${roomNumber}`);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
    navigate("/");
  };

  return (
    <>
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

        <ul
          className={`flex-1 mt-2 overflow-y-auto divide-y divide-gray-300 dark:divide-neutral-500 pr-1 pb-2`}
        >
          {patients.length > 0 ? (
            patients.map(patient => (
              <div
                key={patient._id}
                onClick={() => handlePatientClick(patient)}
                className={`flex duration-200 ease-in-out gap-2 items-center px-2 py-2 my-1 overflow-x-auto rounded ${hoverBg} ${hoverText} cursor-pointer transition ${baseText}`}
              >
                <PersonIcon />
                <li className="truncate">{patient.name}</li>
              </div>
            ))
          ) : (
            <li className={`italic px-2 py-2 ${baseText} opacity-70`}>
              V Této místnosti nejsou žádní pacienti.
            </li>
          )}
        </ul>
      </div>

      <PatientDetailsModal patient={selectedPatient} onClose={handleCloseModal} />
    </>
  );
};

export default RoomsComponent;
