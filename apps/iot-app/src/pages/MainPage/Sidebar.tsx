import React from "react";

import DragHandle from "../../functions/DragHandle";

import SearchBar from "./SearchBar";
import UserList from "./UserList";

interface SidebarProps {
  isSidebarOpen: boolean;
  sidebarWidth: number;
  setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, sidebarWidth, setSidebarWidth }) => {
  return (
    <aside
      style={{ width: isSidebarOpen ? `${sidebarWidth}px` : "0px" }}
      className={` bg-gray-300 flex flex-col overflow-hidden relative`}
    >
      {isSidebarOpen && (
        <>
          <SearchBar />
          <UserList />
          <DragHandle setSidebarWidth={setSidebarWidth} />
        </>
      )}
    </aside>
  );
};

export default Sidebar;
