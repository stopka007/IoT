import React from "react";

import { usePatientModal } from "../context/PatientModalContext";
import { useTheme } from "../functions/ThemeContext";

import PatientDetailsModal from "./PatientDetailsModal";
import AssignDeviceModal from "./assignDeviceModal";
import CreatePatientModal from "./createPatientModal";
import EditPatientModal from "./editPatientModal";

const PatientModals: React.FC = () => {
  const { theme } = useTheme();
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isDetailsModalOpen,
    isAssignDeviceModalOpen,
    selectedPatient,
    closeAllModals,
  } = usePatientModal();

  return (
    <>
      {isCreateModalOpen && (
        <CreatePatientModal isOpen={isCreateModalOpen} onClose={closeAllModals} theme={theme} />
      )}

      {isEditModalOpen && selectedPatient && (
        <EditPatientModal
          isOpen={isEditModalOpen}
          onClose={closeAllModals}
          theme={theme}
          patientId={selectedPatient._id}
        />
      )}

      {isDetailsModalOpen && selectedPatient && (
        <PatientDetailsModal patient={selectedPatient} onClose={closeAllModals} />
      )}

      {isAssignDeviceModalOpen && selectedPatient && (
        <AssignDeviceModal
          isOpen={isAssignDeviceModalOpen}
          onClose={closeAllModals}
          theme={theme}
          initialPatient={selectedPatient._id}
        />
      )}
    </>
  );
};

export default PatientModals;
