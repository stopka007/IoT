import React from "react";

import DragHandle from "../../functions/DragHandle";
import { useTheme } from "../../functions/ThemeContext";

import UserList from "./UserList";

interface SidebarProps {
  isSidebarOpen: boolean;
  sidebarWidth: number;
  setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, sidebarWidth, setSidebarWidth }) => {
  const { theme } = useTheme();
  const sidebarBg = theme === "light" ? "bg-neutral-300" : "bg-neutral-700";

  return (
    <aside
      style={{ width: isSidebarOpen ? `${sidebarWidth}px` : "0px" }}
      className={`${sidebarBg} flex flex-col overflow-hidden relative`}
    >
      {isSidebarOpen && (
        <>
          <UserList />
          <DragHandle setSidebarWidth={setSidebarWidth} />
        </>
      )}
    </aside>
  );
};

export default Sidebar;
