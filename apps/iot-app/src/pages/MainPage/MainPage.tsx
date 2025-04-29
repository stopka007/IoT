import { useState } from "react";
import { Outlet } from "react-router-dom";

import ArrowLeftIcon from "../../Icons/ArrowLeftIcon";
import ArrowRightIcon from "../../Icons/ArrowRightIcon";
import Alert from "../../alerts/Alert";
import CreateDeviceModal from "../../components/CreateDeviceModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import Breadcrumbs from "../../components/MainPageComponent/Breadcrumbs";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../functions/ThemeContext";

export default function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isLoading } = useAuth();
  //onst navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCreateDeviceModal, setShowCreateDeviceModal] = useState(false);

  const headerClass =
    theme === "light"
      ? "bg-gray-100 text-black border-gray-300"
      : "bg-neutral-600 text-white border-white/20";

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const handleLogout = () => {
    logout();
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="h-screen flex overflow-hidden relative">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
      />

      <main className="flex-1 flex flex-col relative">
        <button
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="absolute left-2 top-2 z-10 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 hover:shadow-xs hover:shadow-gray-600/50 transition"
        >
          {isSidebarOpen ? <ArrowLeftIcon /> : <ArrowRightIcon />}
        </button>
        <header className={`p-4 pl-16 border-b ${headerClass} flex items-center justify-between`}>
          <h1 className="text-2xl font-medium">😊 {user ? `(${user.role})` : ""}</h1>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleToggleTheme}
              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 hover:shadow-xs hover:shadow-gray-600/50 transition"
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <button
              onClick={openLogoutModal}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 hover:shadow-xs hover:shadow-red-600/50 transition"
            >
              Logout
            </button>
          </div>
        </header>
        <Breadcrumbs />
        <div className={`p-4 border-b ${headerClass} border-t-0`}>
          <Alert type="warning" title="Warning" message="Possible patient fall!" room="A-105" />
          <Alert
            type="low-battery"
            title="Low battery"
            message="Sensor battery is below 10%"
            room="B-207"
          />
          <Alert type="alert-canceled" title="Alert canceled" message="Alert has been dismissed" />
          <Alert
            type="lost-connection"
            title="Lost connection"
            message="Device disconnected from network"
            room="A-006"
            pacient="antonín komárek"
          />
          <div>
            {user?.role === "admin" && (
              <button
                onClick={() => setShowCreateDeviceModal(true)}
                className="bg-green-500 text-black px-4 py-2 rounded-md hover:bg-green-800 hover:shadow-xs"
              >
                Create Device
              </button>
            )}
          </div>
        </div>
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div
            className={`${theme === "light" ? "bg-white" : "bg-neutral-800"} rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out scale-100 opacity-100`}
          >
            <h3
              className={`text-lg font-medium ${theme === "light" ? "text-gray-900" : "text-white"} mb-4`}
            >
              Confirm Logout
            </h3>
            <p className={`${theme === "light" ? "text-gray-500" : "text-gray-300"} mb-6`}>
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeLogoutModal}
                className={`px-4 py-2 text-sm font-medium ${
                  theme === "light"
                    ? "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-300"
                    : "text-gray-200 bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-500"
                } rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  closeLogoutModal();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Device Modal */}
      <CreateDeviceModal
        isOpen={showCreateDeviceModal}
        onClose={() => setShowCreateDeviceModal(false)}
        theme={theme}
      />
    </div>
  );
}
