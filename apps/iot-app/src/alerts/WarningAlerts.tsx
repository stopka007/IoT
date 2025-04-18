import React, { useState } from "react";

const WarningAlert: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 hover:shadow-xs hover:shadow-gray-600/50 transition"
      >
        Warning
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white text-black p-6 rounded-xl shadow-md w-[90%] max-w-md flex flex-col items-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 text-red-500"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>

            <h3 className="text-2xl font-semibold mb-4 text-red-500">Warning</h3>
            <p className="mb-1">Possible pacient fall!</p>
            <p className="mb-6">Room xxx</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-red-400 font-medium border border-red-300 hover:bg-red-500 rounded text-white transition ease-in-out hover:border-red-500 duration-300 hover:shadow-md"
              >
                Ok
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-neutral-400 font-medium border border-gray-300 hover:bg-gray-600 rounded text-white transition ease-in-out hover:border-gray-600 duration-300 hover:shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WarningAlert;
