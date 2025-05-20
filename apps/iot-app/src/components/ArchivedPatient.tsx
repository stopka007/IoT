import React, { useState } from "react";

import TrashBinIcon from "../Icons/TrashBinIcon";
import apiClient from "../api/axiosConfig";
import { usePatientUpdate } from "../context/PatientUpdateContext";
import { useTheme } from "../functions/ThemeContext";
import ConfirmModal from "../modals/confirmModal";

interface ArchivedPatientProps {
  _id: string;
  name: string;
  room: number;
  illness?: string;
  age?: number;
  status?: string;
  notes?: string;
  createdAt?: string | Date;
  archivedAt?: string | Date;
  onDelete?: () => void;
}

const ArchivedPatient: React.FC<ArchivedPatientProps> = ({
  _id,
  name,
  room,
  illness,
  age,
  status,
  notes,
  createdAt,
  archivedAt,
  onDelete,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { triggerUpdate } = usePatientUpdate();

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "hospitalized":
        return "text-blue-500";
      case "released":
        return "text-green-500";
      case "deceased":
        return "text-red-500";
      default:
        return isDark ? "text-gray-300" : "text-gray-600";
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/archived_patients/${_id}`);
      // Trigger global update to refresh all components
      triggerUpdate();
      // Call the parent component's onDelete callback
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting archived patient:", error);
      alert("Failed to delete patient");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`relative border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow
        ${
          isDark
            ? "bg-neutral-800 border-neutral-700 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            {name}
          </h3>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Room: {room}
          </p>
          {age && (
            <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Age: {age}
            </p>
          )}
          {illness && (
            <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Illness: {illness}
            </p>
          )}
          {status && <p className={`text-sm mb-1 ${getStatusColor(status)}`}>Status: {status}</p>}
        </div>
        <div className="flex flex-col items-end ml-8 min-w-[180px]">
          {createdAt && (
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Created: {new Date(createdAt).toLocaleString()}
            </span>
          )}
          {archivedAt && (
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Archived: {new Date(archivedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
      {notes && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{notes}</p>
        </div>
      )}

      {/* Delete button positioned in bottom right */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md transition-colors duration-200 cursor-pointer"
        >
          {isDeleting ? "Deleting..." : <TrashBinIcon />}
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        theme={theme}
        type="delete"
        title="Delete Patient"
        message={`Are you sure you want to permanently delete patient "${name}"?`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default ArchivedPatient;
