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
  onUpdate?: () => void;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patient,
  onClose,
  onUpdate,
}) => {
  const { theme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignDeviceModalOpen, setIsAssignDeviceModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteDeviceModal, setShowDeleteDeviceModal] = useState(false);
  const [deleteDeviceLoading, setDeleteDeviceLoading] = useState(false);
  const [deleteDeviceError, setDeleteDeviceError] = useState<string | null>(null);
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
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleAssignDeviceClose = () => {
    setIsAssignDeviceModalOpen(false);
    if (onUpdate) {
      onUpdate();
    }
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
      if (onUpdate) {
        onUpdate();
      }
      triggerUpdate();
    } catch (error) {
      console.error("Error unassigning device:", error);
    }
  };

  const handleDeleteDevice = async () => {
    if (!patient.id_device) return;
    setDeleteDeviceLoading(true);
    setDeleteDeviceError(null);
    try {
      await apiClient.delete(`/api/devices/device/${patient.id_device}`);
      setShowDeleteDeviceModal(false);
      onClose();
      if (onUpdate) onUpdate();
      triggerUpdate();
    } catch (err) {
      setDeleteDeviceError("Failed to delete device");
      console.error(err);
    } finally {
      setDeleteDeviceLoading(false);
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
            <button
              onClick={handleEditClick}
              className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                theme === "light"
                  ? "text-white bg-green-500 hover:bg-green-600 focus:ring-green-300"
                  : "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 transition-colors duration-200`}
            >
              Edit Patient
            </button>
            <button
              onClick={handleAssignDeviceClick}
              className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                theme === "light"
                  ? "text-white bg-blue-500 hover:bg-blue-700 focus:ring-blue-500"
                  : "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 transition-colors duration-200`}
            >
              Assign Device
            </button>
            <button
              onClick={handleUnassignDeviceClick}
              className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                theme === "light"
                  ? "text-gray-700 bg-yellow-300 hover:bg-yellow-400 focus:ring-yellow-300"
                  : "text-gray-200 bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-500"
              } focus:outline-none focus:ring-2 transition-colors duration-200`}
            >
              Unassign Device
            </button>
            {patient.id_device && (
              <button
                onClick={() => setShowDeleteDeviceModal(true)}
                className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                  theme === "light"
                    ? "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    : "text-white bg-red-700 hover:bg-red-800 focus:ring-red-500"
                } focus:outline-none focus:ring-2 transition-colors duration-200`}
                disabled={deleteDeviceLoading}
              >
                {deleteDeviceLoading ? "Deleting..." : "Delete Device"}
              </button>
            )}
            <button
              onClick={onClose}
              className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                theme === "light"
                  ? "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-300"
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
      {isAssignDeviceModalOpen && (
        <AssignDeviceModal
          isOpen={isAssignDeviceModalOpen}
          onClose={handleAssignDeviceClose}
          theme={theme}
          onUpdate={onUpdate}
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
      {/* Delete Device Modal */}
      <ConfirmModal
        isOpen={showDeleteDeviceModal}
        onClose={() => setShowDeleteDeviceModal(false)}
        onConfirm={handleDeleteDevice}
        theme={theme}
        type="delete"
        title="Delete Device?"
        message="Opravdu chcete smazat toto zařízení? Tato akce je nevratná."
        confirmButtonText="Delete Device"
        cancelButtonText="Cancel"
      />
      {deleteDeviceError && (
        <div className="text-red-600 text-center mt-2">{deleteDeviceError}</div>
      )}
    </>
  );
};

export default PatientDetailsModal;
