import { useCallback, useState } from "react";
import { Link, Outlet } from "react-router-dom";

import ArrowLeftIcon from "../../Icons/ArrowLeftIcon";
import ArrowRightIcon from "../../Icons/ArrowRightIcon";
import Alert from "../../alerts/Alert";
import { useAuth } from "../../authentication/context/AuthContext";
import LoadingOverlay from "../../components/LoadingOverlay";
import Breadcrumbs from "../../components/MainPageComponent/Breadcrumbs";
import Sidebar from "../../components/SideBarComponent/Sidebar";
import { useTheme } from "../../functions/ThemeContext";
import AssignDeviceModal from "../../modals/assignDeviceModal";
import AssignRoomModal from "../../modals/assignRoomModal";
import ConfirmModal from "../../modals/confirmModal";
import CreateDeviceModal from "../../modals/createDeviceModal";
import CreatePatientModal from "../../modals/createPatientModal";

export default function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCreateDeviceModal, setShowCreateDeviceModal] = useState(false);
  const [showAssignDeviceModal, setShowAssignDeviceModal] = useState(false);
  const [showCreatePatientModal, setShowCreatePatientModal] = useState(false);
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);

  const handleUpdate = useCallback(() => {
    setUpdateKey(prev => prev + 1);
  }, []);

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
            patient="665656565656565656565656"
          />
          <Alert
            type="alert-canceled"
            title="Výstraha zrušena"
            message="Výstraha byla zrušena"
            room="C-301"
            patient="665656565656565656565656"
          />
          <Alert
            type="lost-connection"
            title="Ztráta spojení"
            message="Zařízení odpojeno od sítě"
            room="A-006"
            patient="665656565656565656565656"
          />
          <div>
            {user?.role === "admin" && (
              <div className="space-x-4">
                <button
                  onClick={() => setShowCreateDeviceModal(true)}
                  className="bg-green-500 text-black px-4 py-2 rounded-md hover:bg-green-800 hover:shadow-xs"
                >
                  Vytvořit Zařízení
                </button>
                <button
                  onClick={() => setShowAssignDeviceModal(true)}
                  className="bg-blue-500 text-black px-4 py-2 rounded-md hover:bg-blue-800 hover:shadow-xs"
                >
                  Přiřadit Zařízení
                </button>
                <button
                  onClick={() => setShowCreatePatientModal(true)}
                  className="bg-purple-500 text-black px-4 py-2 rounded-md hover:bg-purple-800 hover:shadow-xs"
                >
                  Vytvořit Pacienta
                </button>

                <button
                  onClick={() => setShowAssignRoomModal(true)}
                  className="bg-orange-500 text-black px-4 py-2 rounded-md hover:bg-orange-800 hover:shadow-xs"
                >
                  Přiřadit Pokoj
                </button>
              </div>
            )}
          </div>
        </div>
        <Outlet context={{ onUpdate: handleUpdate, key: updateKey }} />
      </main>

      {/* Logout Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        theme={theme}
        type="logout"
      />

      {/* Create Device Modal */}
      <CreateDeviceModal
        isOpen={showCreateDeviceModal}
        onClose={() => setShowCreateDeviceModal(false)}
        theme={theme}
        onUpdate={handleUpdate}
      />

      {/* Assign Device Modal */}
      <AssignDeviceModal
        isOpen={showAssignDeviceModal}
        onClose={() => setShowAssignDeviceModal(false)}
        theme={theme}
        onUpdate={handleUpdate}
      />

      {/* Create Patient Modal */}
      <CreatePatientModal
        isOpen={showCreatePatientModal}
        onClose={() => setShowCreatePatientModal(false)}
        theme={theme}
        onUpdate={handleUpdate}
      />

      {/* Assign Room Modal */}
      <AssignRoomModal
        isOpen={showAssignRoomModal}
        onClose={() => {
          setShowAssignRoomModal(false);
          handleUpdate();
        }}
        theme={theme}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
