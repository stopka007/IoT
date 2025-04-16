import React from "react";

import BatteryBar from "./BatteryBar";
import { mockUsers } from "./data";

const UserList: React.FC = () => {
  return (
    <ul className="flex-1 overflow-y-auto bg-gray-200">
      {mockUsers.map((user, index) => (
        <li
          key={index}
          className="border-neutral-300 border-s-stone-200  shadow-neutral-400 shadow-md px-4 py-3 flex justify-between items-center hover:bg-neutral-500 cursor-pointer hover:shadow-xl transform-3d transition duration-400 ease-in-out text-black hover:text-white"
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
