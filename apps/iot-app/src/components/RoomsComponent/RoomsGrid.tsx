import React, { useEffect, useState } from "react";

import { Patient, fetchAllPatients } from "../../functions/patientService";

import RoomsComponent from "./RoomsComponent";

// Define a type for grouped patients by room
interface RoomData {
  roomNumber: number;
  patients: Patient[];
  // message could be derived or fetched separately if needed
}

const RoomsGrid: React.FC = () => {
  const [roomsData, setRoomsData] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const patients = await fetchAllPatients();

        // Group patients by room number
        const groupedByRoom: { [key: number]: Patient[] } = {};
        patients.forEach(patient => {
          if (!groupedByRoom[patient.room]) {
            groupedByRoom[patient.room] = [];
          }
          groupedByRoom[patient.room].push(patient);
        });

        // Convert grouped object to array format for rendering
        const formattedRoomsData = Object.entries(groupedByRoom).map(([roomNum, patientList]) => ({
          roomNumber: parseInt(roomNum, 10),
          patients: patientList,
        }));

        // Sort rooms by room number for consistent order
        formattedRoomsData.sort((a, b) => a.roomNumber - b.roomNumber);

        setRoomsData(formattedRoomsData);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        setError("Nepodařilo se načíst data pacientů."); // User-friendly error message
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, []); // Empty dependency array means this runs once on mount

  if (isLoading) {
    return <div className="p-4 text-center">Načítám data pokojů...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (roomsData.length === 0) {
    return <div className="p-4 text-center">Nebyli nalezeni žádní pacienti.</div>;
  }

  // The component return starts here, separated from the data fetching logic
  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto px-4">
      <div className="flex flex-wrap gap-4 py-4 overflow-y-auto pb-60">
        {roomsData.map(room => (
          <div
            key={room.roomNumber}
            className="p-4 rounded-lg shadow dark:shadow-white/10 transition-colors duration-300"
          >
            <RoomsComponent title={`Pokoj ${room.roomNumber}`} patients={room.patients} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomsGrid;
