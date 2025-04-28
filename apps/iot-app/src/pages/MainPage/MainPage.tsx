import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import ArrowLeftIcon from "../../Icons/ArrowLeftIcon";
import ArrowRightIcon from "../../Icons/ArrowRightIcon";
import Alert from "../../alerts/Alert";
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
  const navigate = useNavigate();

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
              onClick={handleLogout}
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
        </div>
        <Outlet />
      </main>
    </div>
  );
}
