import React from "react";

interface BatteryBarProps {
  battery: number;
}

const getBatteryColor = (level: number): string => {
  if (level < 10) return "bg-red-500 animate-pulse";
  if (level < 20) return "bg-red-500";
  if (level < 50) return "bg-yellow-400";
  if (level < 80) return "bg-green-400";
  return "bg-green-600";
};

const BatteryBar: React.FC<BatteryBarProps> = ({ battery }) => {
  return (
    <>
      <div className="relative w-14 h-6 border-2 border-neutral-800 rounded-sm overflow-hidden text-white text-[10px] font-bold flex items-center justify-center bg-neutral-600 hover:border-1 transition duration-400">
        <div
          className={`${getBatteryColor(battery)} absolute top-0 left-0 h-full`}
          style={{ width: `${battery}%` }}
        />
        <span className="z-10">{battery}%</span>
        <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-1.5 h-3 bg-neutral-600rounded-sm" />
      </div>
      <div className="w-1 h-2 bg-neutral-800 rounded-sm" />
    </>
  );
};

export default BatteryBar;
