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
    theme,
  }: {
    patient: Patient;
    handlePatientClick: (patient: Patient) => void;
    baseBg: string;
    baseText: string;
    hoverBg: string;
    hoverText: string;
    shadow: string;
    theme: "light" | "dark";
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
            <span className={`text-xs ${theme === "light" ? "text-gray-500" : "text-neutral-100"}`}>
              Žádné přiřazené zařízení
            </span>
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

  // Handle filtered patients update
  const handleFilterChange = useCallback((filtered: Patient[]) => {
    setFilteredPatients(filtered);
    setSearchResults(filtered);
  }, []);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllPatients();
      setPatients(data);
      // Initialize filtered patients with all patients
      setFilteredPatients(data);
      setHasAppliedInitialFilter(true);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load patients only once and when updateKey changes
  useEffect(() => {
    loadPatients();
  }, [loadPatients, updateKey]);

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
        theme={theme}
      />
    ));
  }, [filteredPatients, handlePatientClick, baseBg, baseText, hoverBg, hoverText, shadow, theme]);

  return (
    <>
      {loading && <LoadingOverlay />}

      <div className={`p-4 border-b ${borderColor}`}>
        <h2 className="text-2xl font-semibold mb-2">Pacienti</h2>
        <div className="flex items-center">
          <SearchBar patients={patients} onSearchResult={setFilteredPatients} />
          <FilterToggle onToggle={() => setShowFilter(!showFilter)} isActive={showFilter} />
        </div>
        {showFilter && (
          <div className="mt-2">
            <Filter isOpen={showFilter} patients={patients} onFilterChange={handleFilterChange} />
          </div>
        )}
      </div>

      <ul className={`flex-1 overflow-y-auto ${baseBg}`}>{patientList}</ul>
    </>
  );
};

export default React.memo(UserList);
