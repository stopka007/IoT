import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import apiClient from "../../api/axiosConfig";
import { useTheme } from "../../functions/ThemeContext";
import { Patient } from "../../functions/patientService";

interface Room {
  name: number;
  capacity: number;
}

const RoomDetailComponent = () => {
  const { roomNumber } = useParams<{ roomNumber: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, patientsRes] = await Promise.all([
          apiClient.get<{ data: Room[] }>("/api/rooms"),
          apiClient.get<{ data: Patient[] }>("/api/patients"),
        ]);

        const foundRoom = roomRes.data.data.find(r => r.name.toString() === roomNumber);
        if (!foundRoom) {
          setError("Pokoj nebyl nalezen.");
          return;
        }

        setRoom(foundRoom);
        const roomPatients = patientsRes.data.data.filter(p => p.room?.toString() === roomNumber);
        setPatients(roomPatients);
      } catch (err) {
        console.error(err);
        setError("Nepodařilo se načíst informace o pokoji.");
      }
    };

    fetchData();
  }, [roomNumber]);

  const containerClass = theme === "light" ? "bg-white text-gray-800" : "bg-neutral-700 text-white";
  const labelClass = theme === "light" ? "text-gray-600" : "text-gray-300";

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!room) {
    return <div className="p-6 text-center">Načítání informací o pokoji...</div>;
  }

  return (
    <div className="p-6 flex justify-center">
      <div className={`w-full max-w-xl rounded-xl p-6 shadow-md border ${containerClass}`}>
        <h2 className="text-3xl font-bold mb-6 text-center">Pokoj {room.name}</h2>

        <div className="mb-4">
          <span className={`${labelClass} font-semibold`}>Kapacita:</span> {room.capacity}
        </div>

        <div className="mb-4">
          <span className={`${labelClass} font-semibold`}>Počet pacientů:</span> {patients.length}
        </div>

        <div>
          <span className={`${labelClass} font-semibold`}>Pacienti:</span>
          <ul className="list-disc list-inside mt-2">
            {patients.map(p => (
              <li key={p._id}>{p.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailComponent;
