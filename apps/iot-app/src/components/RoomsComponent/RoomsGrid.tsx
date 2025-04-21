import React from "react";

import { mockUsers } from "../data";

import RoomsComponent from "./RoomsComponent";

const groupedByRoom = mockUsers.reduce(
  (acc, user) => {
    if (!acc[user.room]) acc[user.room] = [];
    acc[user.room].push(user);
    return acc;
  },
  {} as Record<string, typeof mockUsers>,
);

const RoomsGrid: React.FC = () => {
  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto px-4">
      <div className="flex flex-wrap gap-4 py-4 overflow-y-auto pb-60">
        {Object.entries(groupedByRoom).map(([roomName, users]) => (
          <div
            key={roomName}
            className="p-2 min-w-[250px] min-h-[200px] flex-shrink-0 basis-[300px]"
          >
            <RoomsComponent
              room={roomName}
              message={users.find(u => u.message)?.message}
              pacients={users.map(user => ({ id: user.id, name: user.name }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomsGrid;
