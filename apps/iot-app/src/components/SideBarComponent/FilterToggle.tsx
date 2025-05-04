import React from "react";

import FilterIcon from "../../Icons/FilterIcon";
import { useTheme } from "../../functions/ThemeContext";

interface FilterToggleProps {
  onToggle: () => void;
  isActive: boolean;
}

const FilterToggle: React.FC<FilterToggleProps> = ({ onToggle, isActive }) => {
  const { theme } = useTheme();
  const bgColor = theme === "light" ? "bg-white" : "bg-neutral-600";
  const borderColor = theme === "light" ? "border-gray-300" : "border-neutral-500";

  return (
    <button
      onClick={onToggle}
      className={`ml-2 w-10 h-10 flex items-center justify-center rounded ${bgColor} border ${borderColor} hover:bg-gray-200 transition ${
        isActive ? "ring-2 ring-blue-500" : ""
      }`}
      aria-label="Filter"
    >
      <FilterIcon />
    </button>
  );
};

export default FilterToggle;
