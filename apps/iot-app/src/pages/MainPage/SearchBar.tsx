import React from "react";

import { useTheme } from "../../functions/ThemeContext";

const SearchBar: React.FC = () => {
  const { theme } = useTheme();

  const containerBorder = theme === "light" ? "border-gray-400" : "border-white/20";
  const inputBg = theme === "light" ? "bg-white" : "bg-neutral-600";
  const inputText = theme === "light" ? "text-black" : "text-white";
  const inputBorder = theme === "light" ? "border-gray-400" : "border-white/30";
  const placeholder = theme === "light" ? "placeholder-gray-500" : "placeholder-white/70";

  return (
    <div className={`p-4 border-b ${containerBorder}`}>
      <h2 className={`text-2xl font-semibold mb-2 ${inputText}`}>Users</h2>
      <input
        type="text"
        placeholder="Search..."
        className={`w-full p-2 rounded ${inputBg} ${inputText} ${inputBorder} ${placeholder} border text-sm`}
      />
    </div>
  );
};

export default SearchBar;
