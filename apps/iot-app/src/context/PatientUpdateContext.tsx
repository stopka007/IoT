import React, { createContext, useCallback, useContext, useState } from "react";

interface PatientUpdateContextType {
  triggerUpdate: () => void;
  updateKey: number;
}

const PatientUpdateContext = createContext<PatientUpdateContextType | undefined>(undefined);

export const usePatientUpdate = () => {
  const ctx = useContext(PatientUpdateContext);
  if (!ctx) throw new Error("usePatientUpdate must be used within PatientUpdateProvider");
  return ctx;
};

export const PatientUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [updateKey, setUpdateKey] = useState(0);

  const triggerUpdate = useCallback(() => {
    setUpdateKey(prev => prev + 1);
  }, []);

  return (
    <PatientUpdateContext.Provider value={{ triggerUpdate, updateKey }}>
      {children}
    </PatientUpdateContext.Provider>
  );
};
