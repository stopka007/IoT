import React, { useCallback, useEffect, useRef, useState } from "react";

// Důležité!
// import { useNavigate } from "react-router-dom";
import { useTheme } from "../../functions/ThemeContext";
import { Battery } from "../../functions/battery";
import { Patient, fetchAllPatients } from "../../functions/patientService";
import PatientDetailsModal from "../../modals/PatientDetailsModal";
import LoadingOverlay from "../LoadingOverlay";

import Filter from "./Filter";
import FilterToggle from "./FilterToggle";
import SearchBar from "./SearchBar";

interface UserListProps {
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserList: React.FC<UserListProps> = ({ showFilter, setShowFilter }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [, setSearchResults] = useState<Patient[]>([]);
  const prevIsOpen = useRef(showFilter);
  const [hasAppliedInitialFilter, setHasAppliedInitialFilter] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-500" : "hover:bg-neutral-400";
  const hoverText = theme === "light" ? "hover:text-white" : "hover:text-black";
  const shadow = theme === "light" ? "shadow-neutral-400" : "shadow-black";
  const borderColor = theme === "light" ? "border-gray-400" : "border-neutral-500";

  const applyInitialFilter = useCallback((patientsList: Patient[]) => {
    // Read filter state from localStorage
    const storedRooms = localStorage.getItem("filter_selectedRooms");
    const storedBattery = localStorage.getItem("filter_batteryFilter");
    const storedSortOrder = localStorage.getItem("filter_sortOrder");

    let parsedRooms: number[] = [];
    let parsedBattery: "Nejvyšší" | "Nejnižší" | null = null;
    let parsedSortOrder: "A-Z" | "Z-A" = "A-Z";

    if (storedRooms) {
      try {
        parsedRooms = JSON.parse(storedRooms);
      } catch {
        /* empty */
      }
    }
    if (storedBattery === "Nejvyšší" || storedBattery === "Nejnižší") {
      parsedBattery = storedBattery;
    }
    if (storedSortOrder === "A-Z" || storedSortOrder === "Z-A") {
      parsedSortOrder = storedSortOrder;
    }

    let filteredResults = [...patientsList];
    if (parsedRooms.length > 0) {
      filteredResults = filteredResults.filter(p => parsedRooms.includes(p.room));
    }
    if (parsedBattery === "Nejvyšší") {
      filteredResults.sort((a, b) => {
        const batteryA = typeof a.battery_level === "number" ? a.battery_level : -1;
        const batteryB = typeof b.battery_level === "number" ? b.battery_level : -1;
        return batteryB - batteryA;
      });
    } else if (parsedBattery === "Nejnižší") {
      filteredResults.sort((a, b) => {
        const batteryA = typeof a.battery_level === "number" ? a.battery_level : 9999;
        const batteryB = typeof b.battery_level === "number" ? b.battery_level : 9999;
        return batteryA - batteryB;
      });
    } else {
      filteredResults.sort((a, b) =>
        parsedSortOrder === "A-Z" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
      );
    }
    setFilteredPatients(filteredResults);
    setSearchResults(filteredResults);
    setHasAppliedInitialFilter(true);
    setSelectedRooms(parsedRooms);
  }, []);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllPatients();
      setPatients(data);
      applyInitialFilter(data);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  }, [applyInitialFilter]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (!prevIsOpen.current && showFilter) {
      setFilteredPatients([]);
    }
    prevIsOpen.current = showFilter;
  }, [showFilter]);

  useEffect(() => {
    if (hasAppliedInitialFilter) {
      localStorage.setItem("filter_selectedRooms", JSON.stringify(selectedRooms));
    }
  }, [selectedRooms, hasAppliedInitialFilter]);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
  };

  const handlePatientUpdated = () => {
    loadPatients();
  };

  return (
    <>
      {loading && <LoadingOverlay />}

      <div className={`p-4 border-b ${borderColor}`}>
        <h2 className="text-2xl font-semibold mb-2">Personál</h2>
        <div className="flex items-center">
          <SearchBar patients={patients} onSearchResult={setFilteredPatients} />
          <FilterToggle onToggle={() => setShowFilter(!showFilter)} isActive={showFilter} />
        </div>
        {showFilter && (
          <div className="mt-2">
            <Filter isOpen={showFilter} patients={patients} onFilterChange={setFilteredPatients} />
          </div>
        )}
      </div>

      <ul className={`flex-1 overflow-y-auto ${baseBg}`}>
        {filteredPatients.map(patient => (
          <li
            key={patient._id}
            onClick={() => handlePatientClick(patient)}
            className={`border-neutral-300 border-s-stone-200 ${shadow} shadow-md px-4 py-3 flex justify-between items-center ${hoverBg} cursor-pointer ${hoverText} transition duration-400 ease-in-out ${baseText}`}
          >
            <div className="flex items-center gap-3">
              <span>{patient.name}</span>
            </div>

            <div className="flex items-center gap-1">
              {patient.id_device ? (
                <Battery batteryLevel={patient.battery_level ?? null} />
              ) : (
                <span className="text-xs text-gray-500 ">No assigned device</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={handleCloseModal}
          onUpdate={handlePatientUpdated}
        />
      )}
    </>
  );
};

export default UserList;
