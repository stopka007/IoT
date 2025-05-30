import { useCallback, useState } from "react";
import { Link, Outlet } from "react-router-dom";

import ArchiveIcon from "../../Icons/ArchiveIcon";
import Alert from "../../alerts/Alert";
import { useAuth } from "../../authentication/context/AuthContext";
import LoadingOverlay from "../../components/LoadingOverlay";
import Breadcrumbs from "../../components/MainPageComponent/Breadcrumbs";
import Sidebar from "../../components/SideBarComponent/Sidebar";
import { useTheme } from "../../functions/ThemeContext";
import ConfirmModal from "../../modals/confirmModal";

export default function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

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

  const openConfirmModal = () => {
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
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
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
      />

      <main className="flex-1 flex flex-col relative">
        <header
          className={`p-4 border-b ${headerClass} flex items-center justify-between relative`}
        >
          <div className="flex items-center space-x-4 ml-[5%]">
            <Breadcrumbs setShowFilter={setShowFilter} setShowDetailedView={setShowDetailedView} />
            <Link
              to="/archive/alerts"
              className={`flex items-center space-x-2 ${
                theme === "light"
                  ? "text-black hover:text-gray-600"
                  : "text-white hover:text-gray-300"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span>Archiv</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleTheme}
              className={` cursor-pointer ${
                theme === "light"
                  ? "text-black hover:text-gray-600"
                  : "text-white hover:text-gray-300"
              }`}
              title={theme === "light" ? "Přepnout na tmavý režim" : "Přepnout na světlý režim"}
            >
              {theme === "light" ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>

            {user?.role === "admin" && (
              <button
                onClick={() => setShowDetailedView(prev => !prev)}
                className={`px-3 py-2 rounded ${
                  theme === "light"
                    ? "bg-gray-200 text-black hover:bg-gray-300"
                    : "bg-neutral-600 duration-200 text-white hover:bg-neutral-700"
                }`}
              >
                {!showDetailedView ? "Přehled pokojů" : "Režim úprav"}
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } flex items-center space-x-1 p-2 rounded hover:bg-gray-200 dark:hover:bg-neutral-700 cursor-pointer`}
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
                  className={`absolute right-0 mt-2 w-48 ${
                    theme === "light" ? "bg-white" : "bg-neutral-700"
                  } rounded-md shadow-lg py-1 z-20`}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <Link
                    to="/profile"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowFilter(false);
                    }}
                    className={`block px-4 py-2 text-sm ${
                      theme === "light"
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-200 hover:bg-neutral-600"
                    }`}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      openConfirmModal();
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      theme === "light"
                        ? "text-red-700 hover:bg-gray-100"
                        : "text-red-400 hover:bg-neutral-600"
                    } cursor-pointer`}
                  >
                    Odhlásit se
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={`p-4 border-b ${headerClass} border-t-0`}>
          <Alert type="warning" title="Varování" message="Možný pád pacienta!" room="A-105" />
          <Alert
            type="low-battery"
            title="Nízká baterie"
            message="Baterie senzoru je pod 30%"
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
        </div>
        <Outlet
          context={{ onUpdate: handleUpdate, key: updateKey, showDetailedView, setShowFilter }}
        />
      </main>

      {/* Logout Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={handleLogout}
        theme={theme}
        type="logout"
      />
    </div>
  );
}
