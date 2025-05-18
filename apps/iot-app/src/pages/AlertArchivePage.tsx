import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import HistoricalAlert from "../alerts/HistoricalAlert";
import apiClient from "../api/axiosConfig";
import { useTheme } from "../functions/ThemeContext";
import { fetchPatientByIdPatient } from "../functions/patientService";

interface AlertType {
  _id: string;
  id_device: string;
  timestamp: Date;
  status: "open" | "resolved";
  type: "warning" | "low-battery" | "alert-canceled" | "lost-connection";
  history: Array<{
    status: string;
    timestamp: Date;
  }>;
  room?: string;
  patient_name?: string;
  patient_id?: string;
}

const AlertArchivePage = () => {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">("all");
  const [devicePatientMap, setDevicePatientMap] = useState<Record<string, string>>(
    /* deviceId -> patientName */ {},
  );

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/api/alerts");
      setAlerts(response.data);
      // After fetching alerts, fetch patient names for each device
      const uniqueDeviceIds = Array.from(new Set(response.data.map((a: AlertType) => a.id_device)));
      const map: Record<string, string> = {};
      await Promise.all(
        (uniqueDeviceIds as string[]).map(async id_device => {
          try {
            const deviceResp = await apiClient.get(`/api/devices/device/${id_device}`);
            const device = deviceResp.data;
            if (device && device.id_patient) {
              const patient = await fetchPatientByIdPatient(device.id_patient);
              map[id_device] = patient.name;
            }
          } catch {
            // ignore errors, leave name undefined
          }
        }),
      );
      setDevicePatientMap(map);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError("Failed to fetch alerts");
      toast.error("Failed to load alerts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const patientName = devicePatientMap[alert.id_device] || "";
    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.id_device.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRetry = () => {
    fetchAlerts();
  };

  const isDark = theme === "dark";

  return (
    <div className={`h-screen flex flex-col ${isDark ? "bg-neutral-800" : "bg-white"}`}>
      <div className="p-4 flex-none">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
              Alert History
            </h2>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Search by patient name..."
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${
                    isDark
                      ? "bg-neutral-700 border-neutral-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as "all" | "open" | "resolved")}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${
                    isDark
                      ? "bg-neutral-700 border-neutral-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              No alerts found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map(alert => (
                <HistoricalAlert
                  key={alert._id}
                  type={alert.type}
                  id_device={alert.id_device}
                  timestamp={alert.timestamp}
                  status={alert.status}
                  history={alert.history}
                  room={alert.room}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertArchivePage;
