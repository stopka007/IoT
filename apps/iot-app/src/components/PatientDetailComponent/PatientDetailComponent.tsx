import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Patient {
  id: string;
  name: string;
  room: string;
  diagnosis: string;
  notes: string;
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Jan Novák",
    room: "101",
    diagnosis: "Chřipka",
    notes: "Citlivý na penicilin",
  },
  {
    id: "2",
    name: "Eva Svobodová",
    room: "102",
    diagnosis: "Zápal plic",
    notes: "Zvláštní pozornost během noci",
  },
];

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const found = mockPatients.find(p => p.id === id);
    setPatient(found ?? null);
  }, [id]);

  if (!patient) {
    return <div className="p-6 text-center text-xl text-red-500">Pacient nebyl nalezen.</div>;
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white dark:bg-neutral-800 shadow-md rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Detail pacienta
        </h2>
        <div className="mb-2 text-gray-700 dark:text-gray-200">
          <strong>Jméno:</strong> {patient.name}
        </div>
        <div className="mb-2 text-gray-700 dark:text-gray-200">
          <strong>Pokoj:</strong> {patient.room}
        </div>
        <div className="mb-2 text-gray-700 dark:text-gray-200">
          <strong>Diagnóza:</strong> {patient.diagnosis}
        </div>
        <div className="text-gray-700 dark:text-gray-200">
          <strong>Poznámky:</strong> {patient.notes}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
