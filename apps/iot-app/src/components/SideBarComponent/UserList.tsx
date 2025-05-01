import React, { useCallback, useEffect, useState } from "react";

// Důležité!
// import { useNavigate } from "react-router-dom";
import { useTheme } from "../../functions/ThemeContext";
import { Battery } from "../../functions/battery";
import { Patient, fetchAllPatients } from "../../functions/patientService";
import PatientDetailsModal from "../../modals/PatientDetailsModal";
import LoadingOverlay from "../LoadingOverlay";

import SearchBar from "./SearchBar";

const UserList: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-500" : "hover:bg-neutral-400";
  const hoverText = theme === "light" ? "hover:text-white" : "hover:text-black";
  const shadow = theme === "light" ? "shadow-neutral-400" : "shadow-black";

  const loadPatients = useCallback(async () => {
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

  return (
    <>
      {loading && <LoadingOverlay />}

      {/* Připojení vyhledávání */}
      <SearchBar patients={patients} onSearchResult={setFilteredPatients} />

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
