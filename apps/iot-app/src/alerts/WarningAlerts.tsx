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
          <div className="bg-white dark:bg-neutral-700 text-black dark:text-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4">⚠️ Warning</h3>
            <p className="mb-6">Possible pacient fall</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
              >
                Ok
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-neutral-600 rounded"
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
