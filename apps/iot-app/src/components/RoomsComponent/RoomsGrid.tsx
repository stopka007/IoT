import React, { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

import apiClient from "../../api/axiosConfig";
import { usePatientUpdate } from "../../context/PatientUpdateContext";
import { useTheme } from "../../functions/ThemeContext";
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
  const { theme } = useTheme();

  // New state for admin layout (default to "grouped" now)
  const [adminLayout, setAdminLayout] = useState<string>("grouped");

  // Add a loading flag ref to prevent duplicate requests
  const isLoadingRef = useRef(false);
  // Add a data cache timestamp
  const lastLoadTime = useRef(0);
  // Cache expiry time (30 seconds)
  const CACHE_EXPIRY = 30000;

  const loadData = useCallback(async (forceRefresh = false) => {
    // Return if already loading
    if (isLoadingRef.current) return;

    // Check if cache is still valid
    const now = Date.now();
    if (!forceRefresh && now - lastLoadTime.current < CACHE_EXPIRY) {
      return;
    }

    // Set loading flags
    isLoadingRef.current = true;
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
      // Update cache timestamp
      lastLoadTime.current = now;
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Nepodařilo se načíst data pokojů.");
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Reload on updates - but with a debounce
  useEffect(() => {
    if (updateKey || globalUpdateKey) {
      const timeoutId = setTimeout(() => {
        loadData(true); // Force refresh
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [loadData, updateKey, globalUpdateKey]);

  if (isLoading && roomsData.length === 0) {
    return <div className="p-4 text-center">Načítám data pokojů...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
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
            className={`px-3 py-2 border rounded-md ${
              theme === "light" ? "bg-gray-100 text-black" : "bg-neutral-700 text-white"
            } cursor-pointer`}
          >
            <option value="grouped">Seskupené</option>
            <option value="compact">Kompaktní</option>
          </select>
        </div>
      )}
      <div className="flex flex-wrap gap-4 py-4 overflow-y-auto pb-60">
        {showDetailedView ? (
          roomsData.length > 0 ? (
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
            <div className="w-full p-4 text-center">Nebyly nalezeny žádné pokoje.</div>
          )
        ) : (
          renderAdminView()
        )}
      </div>
    </div>
  );
};

export default RoomsGrid;
