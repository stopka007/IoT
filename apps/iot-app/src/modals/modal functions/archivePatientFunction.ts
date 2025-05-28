import { useState } from "react";
import toast from "react-hot-toast";

import apiClient from "../../api/axiosConfig";
import { usePatientUpdate } from "../../context/PatientUpdateContext";

export const useArchivePatientLogic = (patientId: string, onClose: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Released");
  const { triggerUpdate } = usePatientUpdate();

  const handleArchive = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First update the patient status
      await apiClient.patch(`/api/patients/${patientId}`, {
        status: status,
      });

      // Then archive the patient
      await apiClient.post(`/api/patients/${patientId}/archive`);
      toast.success("Pacient byl úspěšně archivován");
      triggerUpdate();
      onClose();
    } catch (err) {
      console.error("Error archiving patient:", err);
      setError("Nepodařilo se archivovat pacienta");
      toast.error("Nepodařilo se archivovat pacienta");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, status, setStatus, handleArchive };
};
