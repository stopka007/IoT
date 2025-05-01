import React, { useState } from "react";

// Corrected path
import CloseIcon from "../Icons/CloseIcon";
// Corrected path
import { useTheme } from "../functions/ThemeContext";
import { Patient } from "../functions/patientService";

import EditPatientModal from "./editPatientModal";

// Corrected path

interface PatientDetailsModalProps {
  patient: Patient | null;
  onClose: () => void;
  onUpdate?: () => void; // Add callback for updates
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patient,
  onClose,
  onUpdate,
}) => {
  const { theme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!patient) return null; // Don't render if no patient is selected

  const modalBg = theme === "light" ? "bg-white" : "bg-neutral-700";
  const textColor = theme === "light" ? "text-black" : "text-white";
  const borderColor = theme === "light" ? "border-gray-300" : "border-neutral-500";
  const labelColor = theme === "light" ? "text-gray-600" : "text-gray-300";

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    if (onUpdate) {
      onUpdate(); // Refresh patient data after edit
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
        onClick={onClose} // Close modal on overlay click
      >
        <div
          className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${modalBg} ${textColor} border ${borderColor}`}
          onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside content
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
            aria-label="Zavřít"
          >
            <CloseIcon />
          </button>

          <h3 className="text-2xl font-semibold mb-4 border-b pb-2">{patient.name}</h3>

          <div className="space-y-3 text-sm">
            {" "}
            {/* Ensure no backslashes here */}
            <div>
              <span className={`font-medium ${labelColor}`}>Pokoj:</span> {patient.room}
            </div>
            {patient.age !== undefined && (
              <div>
                <span className={`font-medium ${labelColor}`}>Věk:</span> {patient.age}
              </div>
            )}
            {patient.illness && (
              <div>
                <span className={`font-medium ${labelColor}`}>Nemoc:</span> {patient.illness}
              </div>
            )}
            {patient.notes && (
              <div className="mt-2 pt-2 border-t">
                {" "}
                {/* Ensure no backslashes here */}
                <span className={`font-medium block mb-1 ${labelColor}`}>Poznámky:</span>
                <p className="whitespace-pre-wrap">{patient.notes}</p>{" "}
                {/* Ensure no backslashes here */}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={handleEditClick}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                theme === "light"
                  ? "text-white bg-green-500 hover:bg-green-600 focus:ring-green-300"
                  : "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 transition-colors duration-200`}
            >
              Edit Patient
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                theme === "light"
                  ? "text-gray-700 bg-red-400 hover:bg-gray-200 focus:ring-gray-300"
                  : "text-gray-200 bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-500"
              } focus:outline-none focus:ring-2 transition-colors duration-200`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditPatientModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          theme={theme}
          patientId={patient._id}
        />
      )}
    </>
  );
};

export default PatientDetailsModal;
