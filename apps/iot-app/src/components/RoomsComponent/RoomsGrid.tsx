import React, { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import apiClient from "../../api/axiosConfig";
import { usePatientUpdate } from "../../context/PatientUpdateContext";
import { Patient } from "../../functions/patientService";
import ConnectDeviceComponent from "../AdminView/ConnectDeviceComponent";
import ConnectPacientRoomComponent from "../AdminView/ConnectPacientRoomComponent";
import DeleteDeviceWidget from "../AdminView/DeleteDeviceWidget";
import NewDeviceComponent from "../AdminView/NewDeviceComponent";
import NewPacientComponent from "../AdminView/NewPatientComponent";
import NewRoomComponent from "../AdminView/NewRoomComponent";

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
  setShowFilter?: (show: boolean) => void;
}

const RoomsGrid: React.FC<RoomsGridProps> = ({ setShowFilter }) => {
  const [roomsData, setRoomsData] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { key: updateKey, showDetailedView } = useOutletContext<{
    key: number;
    onUpdate: () => void;
    showDetailedView: boolean;
  }>();
  const { updateKey: globalUpdateKey } = usePatientUpdate();

  // New state for admin layout (default to "grouped" now)
  const [adminLayout, setAdminLayout] = useState<string>("grouped");

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

  // Initial load and reload on global update
  useEffect(() => {
    loadData();
  }, [loadData, updateKey, globalUpdateKey]);

  if (isLoading) {
    return <div className="p-4 text-center">Načítám data pokojů...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (roomsData.length === 0) {
    return <div className="p-4 text-center">Nebyly nalezeny žádné pokoje.</div>;
  }

  // Render admin view based on selected layout
  const renderAdminView = () => {
    switch (adminLayout) {
      case "compact":
        return (
          <div className="grid grid-cols-3 gap-4">
            <NewRoomComponent />
            <NewPacientComponent />
            <NewDeviceComponent />
            <DeleteDeviceWidget />
            <ConnectDeviceComponent />
            <ConnectPacientRoomComponent />
          </div>
        );
      case "grouped":
      default:
        return (
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Přidat</h2>
              <div className="grid grid-cols-3 gap-4">
                <NewRoomComponent />
                <NewPacientComponent />
                <NewDeviceComponent />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-3">Správa</h2>
              <div className="grid grid-cols-3 gap-4">
                <DeleteDeviceWidget />
                <ConnectDeviceComponent />
                <ConnectPacientRoomComponent />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto px-4">
      {!showDetailedView && (
        <div className="mb-4">
          <label className="mr-2">Rozložení:</label>
          <select
            value={adminLayout}
            onChange={e => setAdminLayout(e.target.value)}
            className="px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white cursor-pointer"
          >
            <option value="grouped">Seskupené</option>
            <option value="compact">Kompaktní</option>
          </select>
        </div>
      )}
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
                  setShowFilter={setShowFilter}
                />
              </div>
            ))}
          </>
        ) : (
          renderAdminView()
        )}
      </div>
    </div>
  );
};

export default RoomsGrid;
