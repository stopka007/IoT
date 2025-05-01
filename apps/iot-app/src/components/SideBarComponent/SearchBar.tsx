import React, { useState } from "react";

import FilterIcon from "../../Icons/FilterIcon";
import { useTheme } from "../../functions/ThemeContext";
import { Patient } from "../../functions/patientService";

interface SearchBarProps {
  patients: Patient[];
  onSearchResult: (results: Patient[]) => void;
}

// Funkce pro odstranění diakritiky
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
    <div className={`p-4 border-b ${borderColor}`}>
      <h2 className="text-2xl font-semibold mb-2">Personál</h2>
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          placeholder="Vyhledat pacienta..."
          value={query}
          onChange={handleChange}
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
