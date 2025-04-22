import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import ArrowLeftIcon from "../../Icons/ArrowLeftIcon";
import ArrowRightIcon from "../../Icons/ArrowRightIcon";
import LoadingOverlay from "../../components/LoadingOverlay";
import Breadcrumbs from "../../components/MainPageComponent/Breadcrumbs";
import Sidebar from "../../components/Sidebar";
import { useTheme } from "../../functions/ThemeContext";

// přejmenujeme původní Header

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
          <Breadcrumbs />
        </header>

        <Outlet />
      </main>
    </div>
  );
}
