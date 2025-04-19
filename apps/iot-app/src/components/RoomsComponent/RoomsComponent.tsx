import React from "react";

import HomeIcon from "../../Icons/HomeIcon";
import MessageSquareIcon from "../../Icons/MessageSquareIcon";
import PersonIcon from "../../Icons/UserIcon";
import { useTheme } from "../../functions/ThemeContext";

interface RoomsComponentProps {
  title: string;
  message?: string;
  pacient: string[];
}

const RoomsComponent: React.FC<RoomsComponentProps> = ({ title, pacient, message }) => {
  const { theme } = useTheme();

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-500" : "hover:bg-neutral-400";
  const hoverText = theme === "light" ? "hover:text-white" : "hover:text-black";

  return (
    <div
      className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-md hover:shadow-neutral-500 transition duration-300 ease-in-out`}
    >
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HomeIcon />
          <h2 className={`text-2xl font-bold ${baseText}`}>{title}</h2>
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
        {pacient.map((name, index) => (
          <div
            key={index}
            className={`flex duration-300  ease-in-out gap-2 mb-2 items-center px-2 py-2 overflow-x-auto rounded ${hoverBg} ${hoverText} cursor-pointer transition ${baseText}`}
          >
            <PersonIcon />
            <li>{name}</li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default RoomsComponent;
