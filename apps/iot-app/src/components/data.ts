export interface User {
  id: string;
  name: string;
  room: string;
  battery: number;
  isActive: boolean;
  message?: string;
  diagnosis?: string;
  notes?: string;
}

export const mockUsers: User[] = [
  {
    id: "b632d9e0-728a-43b6-bc07-ce6769605996",
    name: "Patient 2",
    room: "A-101",
    battery: 87,
    isActive: true,
    message: "Hello",
    diagnosis: "Alergie",
    notes: "Alergie na pyl",
  },
  {
    id: "c97f0eba-cd39-457d-a701-23048be45188",
    name: "Patient 3",
    room: "A-102",
    battery: 45,
    isActive: false,
    diagnosis: "Angína",
    notes: "Podávání antibiotik",
  },
  {
    id: "73abb261-b79b-4404-984d-a1d1986d44f4",
    name: "Patient 1",
    room: "B-203",
    battery: 65,
    isActive: true,
    message: "Warning danger",
  },
  {
    id: "9ba2b9a6-3029-4f25-bcc4-d8c8de5f34fa",
    name: "Anna Dvořáková",
    room: "C-305",
    battery: 91,
    isActive: true,
    diagnosis: "Angína",
    notes: "Podávání antibiotik",
  },
  {
    id: "ca3fda1e-d8ec-4e40-bfe4-cbc3bb594f1e",
    name: "Lucie Skálová",
    room: "D-007",
    battery: 34,
    isActive: false,
  },
  {
    id: "dc4282eb-1b1b-44a8-98d5-ff79ca7166a1",
    name: "Petra Skalková",
    room: "D-007",
    battery: 4,
    isActive: true,
  },
];
