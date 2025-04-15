import React from "react";

import BatteryBar from "./BatteryBar";
import { mockUsers } from "./data";

const UserList: React.FC = () => {
  return (
    <ul className="flex-1 overflow-y-auto">
      {mockUsers.map((user, index) => (
        <li
          key={index}
          className="border-b border-white px-4 py-2 flex justify-between items-center hover:bg-gray-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-gray-400"}`}
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
