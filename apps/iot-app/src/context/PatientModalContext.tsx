import React, { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const openCreateModal = useCallback(() => {
    closeAllModals();
    setIsCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback((patient: Patient) => {
    closeAllModals();
    setSelectedPatient(patient);
    setIsEditModalOpen(true);
  }, []);

  const openDetailsModal = useCallback((patient: Patient) => {
    closeAllModals();
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
  }, []);

  const openAssignDeviceModal = useCallback((patient: Patient) => {
    closeAllModals();
    setSelectedPatient(patient);
    setIsAssignDeviceModalOpen(true);
  }, []);

  const closeAllModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsAssignDeviceModalOpen(false);
    setSelectedPatient(null);
    navigate("/");
  }, [navigate]);

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
