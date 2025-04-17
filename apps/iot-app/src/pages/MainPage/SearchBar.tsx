import React from "react";

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-filter"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
