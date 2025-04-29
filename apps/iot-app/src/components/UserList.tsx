import React, { useEffect, useState } from "react";

//import { useNavigate } from "react-router-dom";
import { useTheme } from "../functions/ThemeContext";
import { Battery } from "../functions/battery";
import { Patient, fetchAllPatients } from "../functions/patientService";

import LoadingOverlay from "./LoadingOverlay";
import PatientDetailsModal from "./PatientDetailsModal";

const UserList: React.FC = () => {
  const { theme } = useTheme();
  //const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-500" : "hover:bg-neutral-400";
  const hoverText = theme === "light" ? "hover:text-white" : "hover:text-black";
  const shadow = theme === "light" ? "shadow-neutral-400" : "shadow-black";

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await fetchAllPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      <ul className={`flex-1 overflow-y-auto ${baseBg}`}>
        {patients.map(patient => (
          <li
            key={patient._id}
            onClick={() => handlePatientClick(patient)}
            className={`border-neutral-300 border-s-stone-200 ${shadow} shadow-md px-4 py-3 flex justify-between items-center ${hoverBg} cursor-pointer ${hoverText} transition duration-400 ease-in-out ${baseText}`}
          >
            <div className="flex items-center gap-3">
              {/* <span
                className={`w-2 h-2 rounded-full ${patient.isActive ? "bg-green-500" : "bg-red-700"}`}
                title={patient.isActive ? "Active" : "Inactive"}
              /> */}
              <span>{patient.name}</span>
            </div>

            <div className="flex items-center gap-1">
              <Battery deviceId={patient.id_device} />
            </div>
          </li>
        ))}
      </ul>

      {selectedPatient && (
        <PatientDetailsModal patient={selectedPatient} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default UserList;
