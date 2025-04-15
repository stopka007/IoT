import React from "react";

const SearchBar: React.FC = () => {
  return (
    <div className="p-4 border-b border-gray-400">
      <h2 className="text-2xl font-semibold mb-2">Users</h2>
      <input
        type="text"
        placeholder="Search..."
        className="w-full p-2 rounded bg-white border border-gray-400 text-sm"
      />
    </div>
  );
};

export default SearchBar;
