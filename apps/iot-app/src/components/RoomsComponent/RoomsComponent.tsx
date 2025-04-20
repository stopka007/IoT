import React from "react";
import { useNavigate } from "react-router-dom";

import HomeIcon from "../../Icons/HomeIcon";
import MessageSquareIcon from "../../Icons/MessageSquareIcon";
import PersonIcon from "../../Icons/UserIcon";
import { useTheme } from "../../functions/ThemeContext";

interface Patient {
  id: string;
  name: string;
}

interface RoomsComponentProps {
  room: string;
  message?: string;
  pacients: Patient[];
}

const RoomsComponent: React.FC<RoomsComponentProps> = ({ room, pacients, message }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-500" : "hover:bg-neutral-400";
  const hoverText = theme === "light" ? "hover:text-white" : "hover:text-black";

  const handleClick = (id: string) => {
    navigate(`/patients/${id}`);
  };

  return (
    <div
      className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-md hover:shadow-neutral-500 transition duration-300 ease-in-out`}
    >
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HomeIcon />
          <h2 className={`text-2xl font-bold ${baseText}`}>{room}</h2>
        </div>

        {message && (
          <div className="flex items-center gap-2 mb-4 underline underline-offset-6 shadow-black">
            <MessageSquareIcon />
            <p className={`text-l font-semibold ${baseText}`}>{message}</p>
          </div>
        )}
      </div>

      <ul
        className={`flex-1 mt-6 overflow-y-auto divide-y divide-gray-300 dark:divide-neutral-500 pr-1 pb-4`}
      >
        {pacients.map(patient => (
          <li
            key={patient.id}
            onClick={() => handleClick(patient.id)}
            className={`flex items-center gap-2 mb-2 px-2 py-2 overflow-x-auto rounded cursor-pointer transition duration-300 ease-in-out ${hoverBg} ${hoverText} ${baseText}`}
          >
            <PersonIcon />
            {patient.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomsComponent;
