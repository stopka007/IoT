import React, { useCallback, useEffect, useState } from "react";

// Důležité!
// import { useNavigate } from "react-router-dom";
import { useTheme } from "../../functions/ThemeContext";
import { Battery } from "../../functions/battery";
import { getBatteryLevel } from "../../functions/battery";
import { Patient, fetchAllPatients } from "../../functions/patientService";
import PatientDetailsModal from "../../modals/PatientDetailsModal";
import LoadingOverlay from "../LoadingOverlay";

import Filter from "./Filter";
import FilterToggle from "./FilterToggle";
import SearchBar from "./SearchBar";

interface BatteryCache {
  [deviceId: string]: number;
}

const UserList: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [batteryLevels, setBatteryLevels] = useState<BatteryCache>({});

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-500" : "hover:bg-neutral-400";
  const hoverText = theme === "light" ? "hover:text-white" : "hover:text-black";
  const shadow = theme === "light" ? "shadow-neutral-400" : "shadow-black";
  const borderColor = theme === "light" ? "border-gray-400" : "border-neutral-500";

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllPatients();
      setPatients(data);
      setFilteredPatients(data);
      setSearchResults(data);

      // Fetch battery levels once
      const newBatteryLevels: BatteryCache = {};
      for (const patient of data) {
        try {
          const response = await getBatteryLevel(patient.id_device);
          newBatteryLevels[patient.id_device] = response.battery_level;
        } catch (error) {
          console.error(`Failed to fetch battery for device ${patient.id_device}:`, error);
          newBatteryLevels[patient.id_device] = 0; // Default to 0 if fetch fails
        }
      }
      setBatteryLevels(newBatteryLevels);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
  };

  const handlePatientUpdated = () => {
    loadPatients();
  };
  const [showFilter, setShowFilter] = useState(false);

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
            <Filter
              patients={searchResults}
              onFilterChange={setFilteredPatients}
              batteryLevels={batteryLevels}
            />
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
              <Battery deviceId={patient.id_device} />
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
