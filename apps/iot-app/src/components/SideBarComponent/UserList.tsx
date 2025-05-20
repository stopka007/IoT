import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { usePatientModal } from "../../context/PatientModalContext";
import { usePatientUpdate } from "../../context/PatientUpdateContext";
import { useTheme } from "../../functions/ThemeContext";
import { Battery } from "../../functions/battery";
import { Patient, fetchAllPatients } from "../../functions/patientService";
import LoadingOverlay from "../LoadingOverlay";

import Filter from "./Filter";
import FilterToggle from "./FilterToggle";
import SearchBar from "./SearchBar";

interface UserListProps {
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;
}

// Memoize the patient list item
const PatientListItem = React.memo(
  ({
    patient,
    handlePatientClick,
    baseText,
    hoverBg,
    hoverText,
    shadow,
  }: {
    patient: Patient;
    handlePatientClick: (patient: Patient) => void;
    baseBg: string;
    baseText: string;
    hoverBg: string;
    hoverText: string;
    shadow: string;
  }) => {
    return (
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
    );
  },
);

PatientListItem.displayName = "PatientListItem";

const UserList: React.FC<UserListProps> = ({ showFilter, setShowFilter }) => {
  // Only console.log in development
  if (process.env.NODE_ENV !== "production") {
    console.log("UserList rendered");
  }

  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [, setSearchResults] = useState<Patient[]>([]);
  const prevIsOpen = useRef(showFilter);
  const [hasAppliedInitialFilter, setHasAppliedInitialFilter] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const { updateKey } = usePatientUpdate();
  const { openDetailsModal } = usePatientModal();
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize these values to prevent re-renders
  const themeColors = useMemo(() => {
    return {
      baseBg: theme === "light" ? "bg-gray-200" : "bg-neutral-600",
      baseText: theme === "light" ? "text-black" : "text-white",
      hoverBg: theme === "light" ? "hover:bg-neutral-500" : "hover:bg-neutral-400",
      hoverText: theme === "light" ? "hover:text-white" : "hover:text-black",
      shadow: theme === "light" ? "shadow-neutral-400" : "shadow-black",
      borderColor: theme === "light" ? "border-gray-400" : "border-neutral-500",
    };
  }, [theme]);

  const { baseBg, baseText, hoverBg, hoverText, shadow, borderColor } = themeColors;

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

  // Load patients only once and when updateKey changes
  useEffect(() => {
    loadPatients();
  }, [loadPatients, updateKey]);

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

  // Memoize the handler to prevent re-renders
  const handlePatientClick = useCallback(
    (patient: Patient) => {
      openDetailsModal(patient);
      const params = new URLSearchParams(location.search);
      params.set("patient", patient._id);
      navigate({ search: params.toString() }, { replace: false });
    },
    [openDetailsModal, location.search, navigate],
  );

  // Memoize the patient list
  const patientList = useMemo(() => {
    return filteredPatients.map(patient => (
      <PatientListItem
        key={patient._id}
        patient={patient}
        handlePatientClick={handlePatientClick}
        baseBg={baseBg}
        baseText={baseText}
        hoverBg={hoverBg}
        hoverText={hoverText}
        shadow={shadow}
      />
    ));
  }, [filteredPatients, handlePatientClick, baseBg, baseText, hoverBg, hoverText, shadow]);

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

      <ul className={`flex-1 overflow-y-auto ${baseBg}`}>{patientList}</ul>
    </>
  );
};

export default React.memo(UserList);
