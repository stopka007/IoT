import React from "react";

import { useTheme } from "../../functions/ThemeContext";

import BatteryBar from "./BatteryBar";
import { mockUsers } from "./data";

const UserList: React.FC = () => {
  const { theme } = useTheme();

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-500" : "hover:bg-neutral-400";
  const hoverText = theme === "light" ? "hover:text-white" : "hover:text-black";
  const shadow = theme === "light" ? "shadow-neutral-400" : "shadow-black";

  return (
    <ul className={`flex-1 overflow-y-auto ${baseBg}`}>
      {mockUsers.map((user, index) => (
        <li
          key={index}
          className={`border-neutral-300 border-s-stone-200 ${shadow} shadow-md px-4 py-3 flex justify-between items-center ${hoverBg} cursor-pointer ${hoverText} transform-3d transition duration-400 ease-in-out ${baseText}`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-700"}`}
              title={user.isActive ? "Active" : "Inactive"}
            />
            <span>{user.name}</span>
          </div>

          <div className="flex items-center gap-1">
            <BatteryBar battery={user.battery} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default UserList;
