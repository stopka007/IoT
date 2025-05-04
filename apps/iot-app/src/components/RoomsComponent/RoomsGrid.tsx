import React, { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import apiClient from "../../api/axiosConfig";
import { Patient } from "../../functions/patientService";
import NewPacientComponent from "../NewPatientComponent/NewPatientComponent";

import NewRoomComponent from "./NewRoomwidget";
import RoomsComponent from "./RoomsComponent";

interface Room {
  id: string;
  name: number;
  capacity: number;
}

// Define a type for grouped patients by room
interface RoomData {
  roomNumber: number;
  capacity: number;
  patients: Patient[];
}

interface RoomsGridProps {
  onUpdate?: () => void;
}

const RoomsGrid: React.FC<RoomsGridProps> = ({ onUpdate }) => {
  const [roomsData, setRoomsData] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { key: updateKey, showDetailedView } = useOutletContext<{
    key: number;
    onUpdate: () => void;
    showDetailedView: boolean;
  }>();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch both rooms and patients data
      const [roomsResponse, patientsResponse] = await Promise.all([
        apiClient.get<{ data: Room[] }>("/api/rooms"),
        apiClient.get<{ data: Patient[] }>("/api/patients"),
      ]);

      const rooms = roomsResponse.data.data || roomsResponse.data;
      const patients = patientsResponse.data.data || patientsResponse.data;

      // Create a map of patients by room number
      const patientsByRoom: { [key: number]: Patient[] } = {};
      patients.forEach(patient => {
        if (patient.room) {
          if (!patientsByRoom[patient.room]) {
            patientsByRoom[patient.room] = [];
          }
          patientsByRoom[patient.room].push(patient);
        }
      });

      // Create room data with patients
      const formattedRoomsData = rooms.map(room => ({
        roomNumber: room.name,
        capacity: room.capacity,
        patients: patientsByRoom[room.name] || [],
      }));

      // Sort rooms by room number
      formattedRoomsData.sort((a, b) => a.roomNumber - b.roomNumber);

      setRoomsData(formattedRoomsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Nepodařilo se načíst data pokojů.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Separate effect for handling updates
  useEffect(() => {
    if (onUpdate) {
      loadData();
    }
  }, [onUpdate, loadData, updateKey]);

  if (isLoading) {
    return <div className="p-4 text-center">Načítám data pokojů...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (roomsData.length === 0) {
    return <div className="p-4 text-center">Nebyly nalezeny žádné pokoje.</div>;
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto px-4">
      <div className="flex flex-wrap gap-4 py-4 overflow-y-auto pb-60">
        {showDetailedView ? (
          <>
            {roomsData.map(({ roomNumber, patients }) => (
              <div
                key={roomNumber}
                className="p-2 min-w-[250px] min-h-[200px] flex-shrink-0 basis-[300px]"
              >
                <RoomsComponent
                  title={`Pokoj ${roomNumber}`}
                  patients={patients}
                  onPatientUpdate={loadData}
                />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="p-2 min-w-[250px] min-h-[200px] flex-shrink-0 basis-[300px]">
              <NewRoomComponent />
            </div>
            <div className="p-2 min-w-[250px] min-h-[200px] flex-shrink-0 basis-[300px]">
              <NewPacientComponent />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomsGrid;
