import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import LiveDeviceAlert from "../Monitoring/LiveDeviceAlert";
import TrashBinIcon from "../../Icons/TrashBinIcon";
import PersonIcon from "../../Icons/UserIcon";
import apiClient from "../../api/axiosConfig";
import { useAuth } from "../../authentication/context/AuthContext";
import { usePatientUpdate } from "../../context/PatientUpdateContext";
import { useTheme } from "../../functions/ThemeContext";
import { Patient } from "../../functions/patientService";
import AssignRoomModal from "../../modals/assignRoomModal";
import ConfirmModal from "../../modals/confirmModal";

interface Room {
  _id: string;
  name: number;
  capacity: number;
}

const RoomDetailComponent = () => {
  const { roomNumber } = useParams<{ roomNumber: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const { user } = useAuth();

  const { theme } = useTheme();
  const { updateKey: globalUpdateKey, triggerUpdate } = usePatientUpdate();
  const navigate = useNavigate();
  const location = useLocation();

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
  }, [roomNumber, updateKey, globalUpdateKey]);

  const handleDeleteRoom = async () => {
    if (!room || !room._id) {
      alert("Chyba: pokoj nemá ID.");
      return;
    }

    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteRoom = async () => {
    if (!room || !room._id) return;

    try {
      await apiClient.delete(`/api/rooms/${room._id}`);
      triggerUpdate();
      navigate("/");
    } catch (error) {
      console.error("Chyba při mazání pokoje:", error);
      alert("Nepodařilo se smazat pokoj.");
    }
  };

  const baseBg = theme === "light" ? "bg-gray-200" : "bg-neutral-600";
  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverBg = theme === "light" ? "hover:bg-neutral-300" : "hover:bg-neutral-500";
  const hoverText = theme === "light" ? "hover:text-black" : "hover:text-white";

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    const params = new URLSearchParams(location.search);
    params.set("patient", patient._id);
    navigate({ search: params.toString() }, { replace: false });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientId = params.get("patient");
    if (patientId && patients.length > 0) {
      const found = patients.find(p => p._id === patientId);
      setSelectedPatient(found || null);
    } else if (!patientId) {
      setSelectedPatient(null);
    }
  }, [location.search, patients]);

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!room) {
    return <div className="p-6 text-center">Načítání informací o pokoji...</div>;
  }

  return (
    <div className="p-8 h-full flex justify-center">
      <div
        className={`w-full p-6 border rounded-lg shadow-md ${baseBg} border-gray-300 dark:border-neutral-500 ${baseText} flex flex-col gap-4`}
      >
        <div className="flex items-center gap-2 p-4">
          <HomeIcon />
          <h2 className="text-2xl font-bold">Pokoj {room.name}</h2>
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="px-4 py-2 items-end justify-end bg-gray-500 text-white rounded-md hover:bg-gray-600 cursor-pointer"
              onClick={() => setShowAssignRoomModal(true)}
            >
              Připojit uživatele
            </button>
            {user?.role === "admin" && (
              <button
                className="px-4 py-2 items-end justify-end bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer"
                onClick={handleDeleteRoom}
                title="Smazat pokoj"
              >
                <TrashBinIcon />
              </button>
            )}
          </div>
        </div>

        <div className="text-lg px-4">
          <p>Kapacita pokoje: {room.capacity}</p>
          <p>Obsazenost: {patients.length}</p>
        </div>

        {/* ✅ Live alerty z WebSocketu */}
        <LiveDeviceAlert />

        <div className="flex items-start gap-4">
          <div className="w-[400px] flex flex-col border-r border-gray-300 dark:border-neutral-500 pr-2 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Pacienti</h3>
            <ul className="space-y-1 overflow-y-auto">
              {patients.length > 0 ? (
                patients.map(patient => (
                  <div
                    key={patient._id}
                    onClick={() => handlePatientClick(patient)}
                    className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition ${hoverBg} ${hoverText}`}
                  >
                    <PersonIcon />
                    <li className="truncate">{patient.name}</li>
                  </div>
                ))
              ) : (
                <li className="italic opacity-70">V tomto pokoji nejsou žádní pacienti.</li>
              )}
            </ul>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedPatient ? (
              <div>
                <h3 className="text-xl font-bold mb-4">{selectedPatient.name}</h3>
                <div className="space-y-2 text-lg">
                  <p>
                    <span className="font-semibold">Věk:</span> {selectedPatient.age}
                  </p>
                  <p>
                    <span className="font-semibold">Diagnóza:</span>
                    {selectedPatient.illness}
                  </p>
                  <p>
                    <span className="font-semibold">Pokoj:</span> {selectedPatient.room}
                  </p>
                </div>
              </div>
            ) : (
              <div className="italic opacity-70 mt-4">Vyberte pacienta pro zobrazení detailu.</div>
            )}
          </div>
        </div>
      </div>
      <Outlet context={{ onUpdate: () => setUpdateKey(prev => prev + 1), key: updateKey }} />
      <AssignRoomModal
        isOpen={showAssignRoomModal}
        onClose={() => {
          setShowAssignRoomModal(false);
        }}
        theme={theme}
        initialRoom={room.name}
      />
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDeleteRoom}
        theme={theme}
        type="delete"
        title="Potvrdit smazání pokoje"
        message={`Opravdu chcete smazat pokoj ${room.name}?`}
      />
    </div>
  );
};

export default RoomDetailComponent;
