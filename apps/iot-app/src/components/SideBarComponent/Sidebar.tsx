import React from "react";

import DoubleChevronLeftIcon from "../../Icons/DoubleChevronLeftIcon";
import DoubleChevronRightIcon from "../../Icons/DoubleChevronRightIcon";
import DragHandle from "../../functions/DragHandle";
import { useTheme } from "../../functions/ThemeContext";

import UserList from "./UserList";

interface SidebarProps {
  isSidebarOpen: boolean;
  sidebarWidth: number;
  setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  sidebarWidth,
  setSidebarWidth,
  showFilter,
  setShowFilter,
  onToggle,
}) => {
  const { theme } = useTheme();
  const sidebarBg = theme === "light" ? "bg-neutral-300" : "bg-neutral-700";

  if (!isSidebarOpen) {
    // Closed: show slim bar with button centered
    return (
      <aside
        style={{ width: "32px" }}
        className={`${sidebarBg} flex flex-col items-center justify-center h-full transition-all duration-300 ease-in-out relative shadow-md`}
      >
        <button
          onClick={onToggle}
          className={`transition-all duration-200 mt-0
            ${theme === "light" ? "text-gray-500 hover:bg-neutral-400" : "text-white hover:bg-neutral-600"}`}
          style={{
            padding: 0,
            border: "none",
            background: "none",
            boxShadow: "none",
            outline: "none",
            cursor: "pointer",
          }}
          aria-label="Open sidebar"
        >
          <DoubleChevronRightIcon className="w-6 h-6" />
        </button>
      </aside>
    );
  }

  // Open: show full sidebar with button at right edge
  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className={`${sidebarBg} flex flex-col overflow-hidden relative transition-all duration-300 ease-in-out shadow-md`}
    >
      <button
        onClick={onToggle}
        className={`absolute right-2 top-8 -translate-y-1/2 transition-all duration-200
          ${theme === "light" ? "text-gray-500 hover:bg-neutral-400" : "text-white hover:bg-neutral-600"}`}
        style={{
          padding: 0,
          border: "none",
          background: "none",
          boxShadow: "none",
          outline: "none",
          cursor: "pointer",
        }}
        aria-label="Close sidebar"
      >
        <DoubleChevronLeftIcon className="w-6 h-6" />
      </button>
      <UserList showFilter={showFilter} setShowFilter={setShowFilter} />
      <DragHandle setSidebarWidth={setSidebarWidth} />
    </aside>
  );
};

export default Sidebar;
