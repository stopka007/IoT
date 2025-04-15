import React, { useState } from "react";

import Sidebar from "./Sidebar";

export default function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);

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
          className="absolute left-2 top-2 z-10 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 transition"
        >
          {isSidebarOpen ? "←" : "→"}
        </button>
        <header className="bg-gray-100 text-center text-2xl font-medium py-4 border-b border-gray-300">
          Header
        </header>
        <div className="flex-1 bg-white p-4"></div>
      </main>
    </div>
  );
}
