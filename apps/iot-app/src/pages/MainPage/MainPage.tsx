import { useEffect, useState } from "react";

import ArrowLeftIcon from "../../Icons/ArrowLeftIcon";
import ArrowRightIcon from "../../Icons/ArrowRightIcon";
import Alert from "../../alerts/Alert";
import LoadingOverlay from "../../components/LoadingOverlay";
import Sidebar from "../../components/Sidebar";
import { useTheme } from "../../functions/ThemeContext";

export default function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const headerClass =
    theme === "light"
      ? "bg-gray-100 text-black border-gray-300"
      : "bg-neutral-600 text-white border-white/20";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleToggleTheme = () => {
    setIsLoading(true);
    setTimeout(() => {
      toggleTheme();
      setIsLoading(false);
    }, 250);
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      {isLoading && <LoadingOverlay />}

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

        <button
          onClick={handleToggleTheme}
          className="absolute right-2 top-2 z-10 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 hover:shadow-xs hover:shadow-gray-600/50 transition"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>

        <header className={`text-center text-2xl font-medium py-4 border-b ${headerClass}`}>
          Název aplikace
        </header>

        <div className="flex flex-col gap-4 w-48 p-4">
          <h2 className="text-3xl">Alerts</h2>
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
      </main>
    </div>
  );
}
