import { useState } from "react";

import apiClient from "../../api/axiosConfig";

export const useArchivePatientLogic = (
  patientId: string,
  onClose: () => void,
  onUpdate?: () => void,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArchive = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post(`/api/patients/${patientId}/archive`);
      if (onUpdate) onUpdate();
      onClose();
    } catch {
      setError("Failed to archive patient");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, handleArchive };
};
