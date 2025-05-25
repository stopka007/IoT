import React from "react";

import zxcvbn from "zxcvbn";

interface PasswordStrengthMeterProps {
  password?: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = "" }) => {
  const result = zxcvbn(password);
  const score = result.score;

  const strengthLevels = [
    { label: "Velmi slabé", color: "bg-red-500", width: "w-1/5" },
    { label: "Slabé", color: "bg-orange-500", width: "w-2/5" },
    { label: "Průměrné", color: "bg-yellow-500", width: "w-3/5" },
    { label: "Dobré", color: "bg-lime-500", width: "w-4/5" },
    { label: "Silné", color: "bg-green-500", width: "w-full" },
  ];

  const currentStrength = strengthLevels[score];

  return (
    <div className="mt-1">
      <div className="relative w-full bg-gray-200 rounded h-2" aria-label="Password strength meter">
        {password && (
          <div
            className={`absolute top-0 left-0 h-2 rounded transition-all duration-300 ease-in-out ${currentStrength.color} ${currentStrength.width}`}
            role="presentation"
          ></div>
        )}
      </div>
      {password && (
        <p className="text-xs text-right mt-1" aria-live="polite">
          Síla hesla: <span className={`font-semibold`}>{currentStrength.label}</span>
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
