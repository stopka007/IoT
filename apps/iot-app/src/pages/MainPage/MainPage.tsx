import { useState } from "react";
import { Link, Outlet } from "react-router-dom";

import ArrowLeftIcon from "../../Icons/ArrowLeftIcon";
import ArrowRightIcon from "../../Icons/ArrowRightIcon";
import ChevronDownIcon from "../../Icons/ChevronDownIcon";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        <header
          className={`p-4 pl-16 border-b ${headerClass} flex items-center justify-between relative`}
        >
          <div>{/* Placeholder for left content if needed */}</div>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <button
              onClick={handleToggleTheme}
              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 hover:shadow-xs hover:shadow-gray-600/50 transition"
            >
              {theme === "light" ? "Tmavý režim" : "Světlý režim"}
            </button>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className={`${theme === "light" ? "text-black" : "text-white"} flex items-center space-x-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700`}
              >
                <span>{user?.username || "User"}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              {isDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 ${theme === "light" ? "bg-white" : "bg-neutral-700"} rounded-md shadow-lg py-1 z-20`}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`block px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-neutral-600"}`}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      openLogoutModal();
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${theme === "light" ? "text-red-700 hover:bg-gray-100" : "text-red-400 hover:bg-neutral-600"}`}
                  >
                    Odhlásit se
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <Breadcrumbs />
        <div className={`p-4 border-b ${headerClass} border-t-0`}>
          <Alert type="warning" title="Varování" message="Možný pád pacienta!" room="A-105" />
          <Alert
            type="low-battery"
            title="Nízká baterie"
            message="Baterie senzoru je pod 10%"
            room="B-207"
          />
          <Alert type="alert-canceled" title="Výstraha zrušena" message="Výstraha byla zrušena" />
          <Alert
            type="lost-connection"
            title="Ztráta spojení"
            message="Zařízení odpojeno od sítě"
            room="A-006"
            pacient="antonín komárek"
          />
          <div>
            {user?.role === "admin" && (
              <button
                onClick={() => setShowCreateDeviceModal(true)}
                className="bg-green-500 text-black px-4 py-2 rounded-md hover:bg-green-800 hover:shadow-xs"
              >
                Vytvořit Zařízení
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
              Potvrdit Odhlášení
            </h3>
            <p className={`${theme === "light" ? "text-gray-500" : "text-gray-300"} mb-6`}>
              Opravdu se chcete odhlásit?
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
                Zrušit
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  closeLogoutModal();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
              >
                Odhlásit se
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
