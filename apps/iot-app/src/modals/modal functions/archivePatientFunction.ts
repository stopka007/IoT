import { useState } from "react";

import apiClient from "../../api/axiosConfig";
import { usePatientUpdate } from "../../context/PatientUpdateContext";

export const useArchivePatientLogic = (patientId: string, onClose: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { triggerUpdate } = usePatientUpdate();

  const handleArchive = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post(`/api/patients/${patientId}/archive`);
      triggerUpdate();
      onClose();
    } catch {
      setError("Failed to archive patient");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, handleArchive };
};
