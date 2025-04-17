import React, { useState } from "react";

import { useTheme } from "../../functions/ThemeContext";

import Sidebar from "./Sidebar";

export default function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const { theme, toggleTheme } = useTheme();

  const headerClass =
    theme === "light"
      ? "bg-gray-100 text-black border-gray-300"
      : "bg-neutral-600 text-white border-white/20";

  return (
    <div className="h-screen flex overflow-hidden">
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
          {isSidebarOpen ? "←" : "→"}
        </button>

        <button
          onClick={toggleTheme}
          className="absolute right-2 top-2 z-10 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 hover:shadow-xs hover:shadow-gray-600/50 transition"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>

        <header className={`text-center text-2xl font-medium py-4 border-b ${headerClass}`}>
          Header
        </header>

        <div className="flex-1 p-4"></div>
      </main>
    </div>
  );
}
