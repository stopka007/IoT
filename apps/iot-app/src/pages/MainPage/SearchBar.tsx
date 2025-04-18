import React from "react";

import FilterIcon from "../../Icons/FilterIcon";
import { useTheme } from "../../functions/ThemeContext";

const SearchBar: React.FC = () => {
  const { theme } = useTheme();
  const bgColor = theme === "light" ? "bg-white" : "bg-neutral-600";
  const textColor = theme === "light" ? "text-black" : "text-white";
  const borderColor = theme === "light" ? "border-gray-400" : "border-neutral-500";

  return (
    <div className={`p-4 border-b ${borderColor}`}>
      <h2 className="text-2xl font-semibold mb-2">Personál</h2>
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          placeholder="Search..."
          className={`w-full p-2 rounded ${bgColor} ${textColor} border ${borderColor} text-sm`}
        />
        <button
          className={`ml-2 p-2 rounded ${bgColor} ${textColor} border ${borderColor} hover:bg-opacity-80 transition`}
        >
          <FilterIcon />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
