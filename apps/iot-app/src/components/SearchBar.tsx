import React, { useState } from "react";

import { useTheme } from "../functions/ThemeContext";
import { Patient } from "../functions/patientService";

interface SearchBarProps {
  patients: Patient[];
  onSearchResult: (results: Patient[]) => void;
}

const removeDiacritics = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
};

const SearchBar: React.FC<SearchBarProps> = ({ patients, onSearchResult }) => {
  const [query, setQuery] = useState("");
  const { theme } = useTheme();

  const bgColor = theme === "light" ? "bg-white" : "bg-neutral-600";
  const textColor = theme === "light" ? "text-black" : "text-white";
  const borderColor = theme === "light" ? "border-gray-400" : "border-neutral-500";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    const normalizedQuery = removeDiacritics(newQuery);
    const filtered = patients.filter(p => removeDiacritics(p.name).includes(normalizedQuery));

    onSearchResult(filtered);
  };

  return (
    <div className={`flex-1 mr-2`}>
      <input
        type="text"
        placeholder="Vyhledat pacienta..."
        value={query}
        onChange={handleChange}
        className={`w-full p-2 rounded ${bgColor} ${textColor} border ${borderColor} text-sm`}
      />
    </div>
  );
};

export default SearchBar;
