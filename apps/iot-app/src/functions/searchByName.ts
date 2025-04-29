import { Patient } from "./patientService"; // Importuj správný typ

export function searchByName(query: string, patients: Patient[]): Patient[] {
  const lowerQuery = query.toLowerCase();
  return patients.filter((p) =>
    p.name.toLowerCase().includes(lowerQuery)
  );
}
