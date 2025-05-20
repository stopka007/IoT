import React, { createContext, useCallback, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Patient } from "../functions/patientService";

interface PatientModalContextType {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDetailsModalOpen: boolean;
  isAssignDeviceModalOpen: boolean;
  selectedPatient: Patient | null;
  openCreateModal: () => void;
  openEditModal: (patient: Patient) => void;
  openDetailsModal: (patient: Patient) => void;
  openAssignDeviceModal: (patient: Patient) => void;
  closeAllModals: () => void;
}

const PatientModalContext = createContext<PatientModalContextType | undefined>(undefined);

export const usePatientModal = () => {
  const ctx = useContext(PatientModalContext);
  if (!ctx) throw new Error("usePatientModal must be used within PatientModalProvider");
  return ctx;
};

export const PatientModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignDeviceModalOpen, setIsAssignDeviceModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Define the closeAllModals function first
  const closeAllModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsAssignDeviceModalOpen(false);
    setSelectedPatient(null);

    // Remove patient query parameter if it exists, but don't navigate away from current page
    if (location.search) {
      const params = new URLSearchParams(location.search);
      if (params.has("patient")) {
        params.delete("patient");
        // Update URL without changing the current page
        const newSearch = params.toString() ? `?${params.toString()}` : "";
        navigate({ pathname: location.pathname, search: newSearch }, { replace: true });
      }
    }
  }, [navigate, location]);

  const openCreateModal = useCallback(() => {
    closeAllModals();
    setIsCreateModalOpen(true);
  }, [closeAllModals]);

  const openEditModal = useCallback(
    (patient: Patient) => {
      closeAllModals();
      setSelectedPatient(patient);
      setIsEditModalOpen(true);
    },
    [closeAllModals],
  );

  const openDetailsModal = useCallback(
    (patient: Patient) => {
      closeAllModals();
      setSelectedPatient(patient);
      setIsDetailsModalOpen(true);
    },
    [closeAllModals],
  );

  const openAssignDeviceModal = useCallback(
    (patient: Patient) => {
      closeAllModals();
      setSelectedPatient(patient);
      setIsAssignDeviceModalOpen(true);
    },
    [closeAllModals],
  );

  return (
    <PatientModalContext.Provider
      value={{
        isCreateModalOpen,
        isEditModalOpen,
        isDetailsModalOpen,
        isAssignDeviceModalOpen,
        selectedPatient,
        openCreateModal,
        openEditModal,
        openDetailsModal,
        openAssignDeviceModal,
        closeAllModals,
      }}
    >
      {children}
    </PatientModalContext.Provider>
  );
};
