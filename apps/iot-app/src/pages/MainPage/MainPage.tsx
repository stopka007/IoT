import { useCallback, useState } from "react";
import { Link, Outlet } from "react-router-dom";

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
          <div>{/* Placeholder for left content if needed */}</div>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <button
              onClick={handleToggleTheme}
              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 hover:shadow-xs hover:shadow-gray-600/50 transition cursor-pointer"
            >
              {theme === "light" ? "Tmavý režim" : "Světlý režim"}
            </button>

            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showDetailedView}
                  onChange={() => setShowDetailedView(prev => !prev)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className={`${theme === "light" ? "text-black" : "text-white"} flex items-center space-x-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer`}
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
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowFilter(false);
                    }}
                    className={`block px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-neutral-600"}`}
                  >
                    Profil
                  </Link>
                  <Link
                    to="/archive/alerts" // This will navigate to the alert archive page
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowFilter(false);
                    }}
                    className={`block px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-neutral-600"}`}
                  >
                    Archiv
                  </Link>
                  <button
                    onClick={() => {
                      openConfirmModal();
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${theme === "light" ? "text-red-700 hover:bg-gray-100" : "text-red-400 hover:bg-neutral-600"} cursor-pointer`}
                  >
                    Odhlásit se
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <Breadcrumbs setShowFilter={setShowFilter} />
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
