import React, { useState } from "react";

import CloseIcon from "../Icons/CloseIcon";
import apiClient from "../api/axiosConfig";
import { usePatientUpdate } from "../context/PatientUpdateContext";
import { useTheme } from "../functions/ThemeContext";
import { Patient } from "../functions/patientService";

import AssignDeviceModal from "./assignDeviceModal";
import ConfirmModal from "./confirmModal";
import EditPatientModal from "./editPatientModal";

interface PatientDetailsModalProps {
  patient: Patient | null;
  onClose: () => void;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({ patient, onClose }) => {
  const { theme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignDeviceModalOpen, setIsAssignDeviceModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { triggerUpdate } = usePatientUpdate();
  if (!patient) return null;

  const modalBg = theme === "light" ? "bg-white" : "bg-neutral-700";
  const textColor = theme === "light" ? "text-black" : "text-white";
  const borderColor = theme === "light" ? "border-gray-300" : "border-neutral-500";
  const labelColor = theme === "light" ? "text-gray-600" : "text-gray-300";

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleAssignDeviceClick = () => {
    setIsAssignDeviceModalOpen(true);
  };

  const handleUnassignDeviceClick = () => {
    setShowConfirmModal(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    triggerUpdate();
  };

  const handleAssignDeviceClose = () => {
    setIsAssignDeviceModalOpen(false);
    triggerUpdate();
  };

  const handleUnassignDevice = async () => {
    try {
      // Update the patient to remove device reference
      await apiClient.patch(`/api/patients/${patient._id}`, {
        id_device: "",
      });

      // Update the device to remove patient reference
      if (patient.id_device) {
        await apiClient.patch(`/api/devices/device/${patient.id_device}`, {
          id_patient: "",
          patient_name: "",
          room: undefined,
        });
      }

      // Close modal and trigger update
      onClose();
      triggerUpdate();
    } catch (error) {
      console.error("Error unassigning device:", error);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${modalBg} ${textColor} border ${borderColor}`}
          onClick={e => e.stopPropagation()}
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
                <span className={`font-medium block mb-1 ${labelColor}`}>Poznámky:</span>
                <p className="whitespace-pre-wrap">{patient.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleEditClick}
                className={`px-2 py-2 text-sm font-medium rounded-lg flex items-center gap-2 cursor-pointer border ${
                  theme === "light"
                    ? "text-green-600 border-green-600 hover:bg-green-600 hover:text-white focus:ring-green-300"
                    : "text-green-500 border-green-500 hover:bg-green-600 hover:text-white focus:ring-green-500"
                } focus:outline-none focus:ring-2 transition-colors duration-200`}
              >
                Upravit Pacienta
              </button>
              <button
                onClick={handleAssignDeviceClick}
                className={`px-2 py-2 text-sm font-medium rounded-lg flex items-center gap-2 cursor-pointer border ${
                  theme === "light"
                    ? "text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500"
                    : "text-blue-500 border-blue-500 hover:bg-blue-600 hover:text-white focus:ring-blue-500"
                } focus:outline-none focus:ring-2 transition-colors duration-200`}
              >
                Přiřadit zařízení
              </button>
              <button
                onClick={handleUnassignDeviceClick}
                className={`px-2 py-2 text-sm font-medium rounded-lg flex items-center gap-2 cursor-pointer border ${
                  theme === "light"
                    ? "text-yellow-600 border-yellow-600 hover:bg-yellow-600 hover:text-white focus:ring-yellow-300"
                    : "text-yellow-500 border-yellow-500 hover:bg-yellow-600 hover:text-white focus:ring-yellow-500"
                } focus:outline-none focus:ring-2 transition-colors duration-200`}
              >
                Odebrat zařízení
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onClose}
                className={`px-2 py-2 text-sm font-medium rounded-lg flex items-center gap-2 cursor-pointer border ${
                  theme === "light"
                    ? "text-gray-600 border-gray-300 hover:bg-gray-600 hover:text-white focus:ring-gray-300"
                    : "text-gray-400 border-gray-600 hover:bg-gray-600 hover:text-white focus:ring-neutral-500"
                } focus:outline-none focus:ring-2 transition-colors duration-200`}
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditPatientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            handleEditClose();
            onClose();
          }}
          theme={theme}
          patientId={patient._id}
        />
      )}
      {isAssignDeviceModalOpen && (
        <AssignDeviceModal
          isOpen={isAssignDeviceModalOpen}
          onClose={() => {
            handleAssignDeviceClose();
            onClose();
          }}
          theme={theme}
          initialPatient={patient._id}
        />
      )}
      {/* Logout Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleUnassignDevice}
        theme={theme}
        type="unassign-device"
      />
    </>
  );
};

export default PatientDetailsModal;
