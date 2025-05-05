import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import ArrowLeftRightIcon from "../../Icons/ArrowLeftRightIcon";
import BiggerHomeIcon from "../../Icons/BiggerHomeIcon";
import BiggerPersonIcon from "../../Icons/BiggerUserIcon";
import apiClient from "../../api/axiosConfig";
import { useTheme } from "../../functions/ThemeContext";
import { Patient } from "../../functions/patientService";
import AssignRoomModal from "../../modals/assignRoomModal";

interface Room {
  name: number;
  capacity: number;
}

const ConnectPacientRoomComponent = () => {
  const { theme } = useTheme();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [, setPatients] = useState<Patient[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, patientsRes] = await Promise.all([
          apiClient.get<{ data: Room[] }>("/api/rooms"),
          apiClient.get<{ data: Patient[] }>("/api/patients"),
        ]);
        setRooms(roomsRes.data.data);
        setPatients(patientsRes.data.data);
      } catch (err) {
        console.error(err);
        setError("Nepodařilo se načíst data.");
      }
    };

    fetchData();
  }, [updateKey]);

  const handleUpdate = useCallback(() => {
    setUpdateKey(prev => prev + 1);
  }, []);

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div
        className={`max-w-sm w-full p-4 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 h-[250px] flex flex-col justify-between hover:shadow-lg transition duration-300 ease-in-out`}
      >
        <span className="flex items-center justify-center text-2xl">
          Přiřadit pacienta do pokoje
        </span>
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={() => {
              if (rooms.length > 0) {
                setSelectedRoom(rooms[0]);
                setShowAssignRoomModal(true);
              }
            }}
            className="border-2 rounded-full p-2 hover:shadow-2xl transform duration-300 shadow-black"
          >
            <div className="flex justify-center items-center px-1">
              <BiggerHomeIcon />
              <ArrowLeftRightIcon />
              <BiggerPersonIcon />
            </div>
          </button>
        </div>
      </div>

      {selectedRoom && (
        <AssignRoomModal
          isOpen={showAssignRoomModal}
          onClose={() => {
            setShowAssignRoomModal(false);
            handleUpdate();
          }}
          theme={theme}
          onUpdate={handleUpdate}
          initialRoom={selectedRoom.name}
        />
      )}

      <Outlet context={{ onUpdate: handleUpdate, key: updateKey }} />
    </>
  );
};

export default ConnectPacientRoomComponent;
