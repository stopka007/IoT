import React, { useState } from "react";

interface AlertProps {
  type: "warning" | "low-battery" | "alert-canceled" | "lost-connection";
  title: string;
  message: string;
  room?: string;
}

const iconMap = {
  warning: (
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
      className="text-red-500"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  "low-battery": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-yellow-400"
      viewBox="0 0 24 24"
    >
      <rect x="2" y="7" width="18" height="10" rx="2" ry="2" />
      <line x1="22" y1="11" x2="22" y2="13" />
    </svg>
  ),
  "alert-canceled": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-500"
      viewBox="0 0 24 24"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  "lost-connection": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-purple-500"
      viewBox="0 0 24 24"
    >
      <path d="M16 8a6 6 0 0 0-8 0" />
      <path d="M12 20v.01" />
      <path d="M12 16v.01" />
      <path d="M12 12v.01" />
    </svg>
  ),
};

const Alert: React.FC<AlertProps> = ({ type, title, message, room }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 hover:shadow-xs hover:shadow-gray-600/50 transition"
      >
        {title}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white text-black  p-6 rounded-xl shadow-md w-[90%] max-w-md flex flex-col items-center text-center">
            <div className="mb-4">{iconMap[type]}</div>

            <h3 className="text-2xl font-semibold mb-4">{title}</h3>
            <p className="mb-1">{message}</p>
            {room && <p className="mb-6">Room {room}</p>}
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

export default Alert;
