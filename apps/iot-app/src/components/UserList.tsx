import React, { useEffect, useState } from "react";

import { useTheme } from "../functions/ThemeContext";
import { Battery } from "../functions/battery";
import { Patient, fetchAllPatients } from "../functions/patientService";

import Filter from "./Filter";
import LoadingOverlay from "./LoadingOverlay";
import PatientDetailsModal from "./PatientDetailsModal";

const UserList: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-500" : "hover:bg-neutral-400";
  const hoverText = theme === "light" ? "hover:text-white" : "hover:text-black";
  const shadow = theme === "light" ? "shadow-neutral-400" : "shadow-black";
  const headerBg = theme === "light" ? "bg-white" : "bg-neutral-700";
  const borderColor = theme === "light" ? "border-gray-300" : "border-neutral-600";

  // Remove diacritics for better search
  const removeDiacritics = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  };

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const data = await fetchAllPatients();
        setPatients(data);
        setFilteredPatients(data);
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredPatients(patients);
    } else {
      const normalizedQuery = removeDiacritics(query);
      const filtered = patients.filter(p => removeDiacritics(p.name).includes(normalizedQuery));
      setFilteredPatients(filtered);
    }
  };

  // Handle filter changes from Filter component
  const handleFilterChange = (filtered: Patient[]) => {
    // If search is active, filter the search results
    if (searchQuery.trim()) {
      const normalizedQuery = removeDiacritics(searchQuery);
      setFilteredPatients(filtered.filter(p => removeDiacritics(p.name).includes(normalizedQuery)));
    } else {
      setFilteredPatients(filtered);
    }
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
  };

  return (
    <>
      {loading && <LoadingOverlay />}

      <div className={`p-4 border-b ${headerBg} ${borderColor}`}>
        <h2 className="text-2xl font-semibold mb-2">Personál</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Vyhledat pacienta..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={`w-full p-2 rounded ${theme === "light" ? "bg-white text-black" : "bg-neutral-600 text-white"} border ${borderColor} text-sm`}
          />
          <Filter patients={patients} onFilterChange={handleFilterChange} />
        </div>
      </div>

      <ul className={`flex-1 overflow-y-auto ${baseBg}`}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <li
              key={patient._id}
              onClick={() => handlePatientClick(patient)}
              className={`border-neutral-300 border-s-stone-200 ${shadow} shadow-md px-4 py-3 flex justify-between items-center ${hoverBg} cursor-pointer ${hoverText} transition duration-400 ease-in-out ${baseText}`}
            >
              <div className="flex items-center gap-3">
                <span>{patient.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <Battery deviceId={patient.id_device} />
              </div>
            </li>
          ))
        ) : (
          <li className={`px-4 py-3 ${baseText} text-center italic`}>
            Žádní pacienti neodpovídají kritériím vyhledávání
          </li>
        )}
      </ul>

      {selectedPatient && (
        <PatientDetailsModal patient={selectedPatient} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default UserList;
