import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";

import ReloadIcon from "../Icons/ReloadIcon";
import HistoricalAlert from "../alerts/HistoricalAlert";
import apiClient from "../api/axiosConfig";
import ArchivedPatient from "../components/ArchivedPatient";
import { usePatientUpdate } from "../context/PatientUpdateContext";
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

interface PatientType {
  _id: string;
  id_patient: string;
  name: string;
  room: number;
  illness?: string;
  age?: number;
  status?: string;
  notes?: string;
  createdAt?: Date;
  archivedAt?: Date;
}

const AlertArchivePage = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">("all");
  const [activeTab, setActiveTab] = useState<"alerts" | "patients">("alerts");
  const [devicePatientMap, setDevicePatientMap] = useState<Record<string, string>>({});
  const { updateKey } = usePatientUpdate();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/archive/patients") {
      setActiveTab("patients");
    } else {
      setActiveTab("alerts");
    }
  }, [location.pathname]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/api/alerts");
      const sortedAlerts = response.data.sort(
        (a: AlertType, b: AlertType) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      setAlerts(sortedAlerts);
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

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/api/archived_patients");
      setPatients(response.data.data || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to fetch patients");
      toast.error("Failed to load patients. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "alerts") {
      fetchAlerts();
    } else {
      fetchPatients();
    }
  }, [activeTab, updateKey]);

  const filteredAlerts = alerts.filter(alert => {
    const patientName = devicePatientMap[alert.id_device] || "";
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPatients = patients.filter(patient => {
    return patient.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRetry = () => {
    if (activeTab === "alerts") {
      fetchAlerts();
    } else {
      fetchPatients();
    }
  };

  const handleDeletePatient = () => {
    fetchPatients();
    toast.success("Patient deleted successfully");
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`overflow-y-auto h-screen flex flex-col ${isDark ? "bg-neutral-900" : "bg-white"}`}
    >
      <div className="p-4 flex-none">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex space-x-4">
              <Link
                to="/archive/alerts"
                onClick={() => {
                  setActiveTab("alerts");
                  handleRetry();
                }}
                className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === "alerts"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-400 text-white hover:bg-gray-700"
                }`}
              >
                Alert History
              </Link>
              <Link
                to="/archive/patients"
                onClick={() => {
                  setActiveTab("patients");
                  handleRetry();
                }}
                className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === "patients"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-400 text-white hover:bg-gray-700"
                }`}
              >
                Patients
              </Link>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <ReloadIcon />
              </button>
              <input
                type="text"
                placeholder={`Search by ${activeTab === "alerts" ? "patient name..." : "name..."}`}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer
                  ${
                    isDark
                      ? "bg-neutral-700 border-neutral-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {activeTab === "alerts" && (
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as "all" | "open" | "resolved")}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer
                    ${
                      isDark
                        ? "bg-neutral-700 border-neutral-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>
              )}
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
          ) : activeTab === "alerts" ? (
            filteredAlerts.length === 0 ? (
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
                    patient_name={devicePatientMap[alert.id_device] || "Unknown"}
                  />
                ))}
              </div>
            )
          ) : filteredPatients.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              No patients found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map(patient => (
                <ArchivedPatient
                  key={patient._id}
                  _id={patient._id}
                  name={patient.name}
                  room={patient.room}
                  illness={patient.illness}
                  age={patient.age}
                  status={patient.status}
                  notes={patient.notes}
                  createdAt={patient.createdAt}
                  archivedAt={patient.archivedAt}
                  onDelete={handleDeletePatient}
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
