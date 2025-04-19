import React from "react";

import RoomsComponent from "./RoomsComponent";

const RoomsGrid: React.FC = () => {
  const roomsData = [
    { title: "A-101", message: "Hello", pacient: ["Jan Novák", "Petr Karásek"] },
    { title: "A-102", message: "Stepan", pacient: ["Anna Dvořáková"] },
    {
      title: "B-203",
      message: "Warning danger",
      pacient: ["Eva Černá", "Tomáš Marek", "Jana Nová"],
    },
    { title: "C-305", pacient: ["Martin Havel"] },
    { title: "D-007", pacient: ["Lucie Skálová"] },
    {
      title: "E-201",
      pacient: ["Filip Hrubý", "Veeeeeeerrrrrrryyyyyyyy loooooooooong naaaaaaamee"],
    },
    {
      title: "F-010",
      pacient: ["Veronika Pokorná", "Adam Mach", "Daniel Vavra", "Havel"],
    },
  ];

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto px-4">
      <div className="flex flex-wrap gap-4 py-4 overflow-y-auto pb-60">
        {roomsData.map((room, index) => (
          <div key={index} className="p-2 min-w-[250px] min-h-[200px] flex-shrink-0 basis-[300px]">
            <RoomsComponent title={room.title} message={room.message} pacient={room.pacient} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomsGrid;
