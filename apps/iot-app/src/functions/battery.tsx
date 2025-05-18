import React from "react";

const getBatteryColor = (level: number): string => {
  if (level < 10) return "bg-red-500 animate-pulse";
  if (level < 20) return "bg-red-500";
  if (level < 50) return "bg-yellow-400";
  if (level < 80) return "bg-green-400";
  return "bg-green-600";
};

const getGlowColor = (level: number): string => {
  if (level < 20) return "0 0 8px 4px rgba(239, 68, 68, 0.6)";
  if (level < 50) return "0 0 8px 4px rgba(250, 204, 21, 0.6)";
  if (level < 80) return "0 0 8px 4px rgba(74, 222, 128, 0.6)";
  return "0 0 8px 4px rgba(22, 163, 74, 0.6)";
};

interface BatteryProps {
  batteryLevel: number | null;
}

export const Battery: React.FC<BatteryProps> = ({ batteryLevel }) => {
  if (batteryLevel === null || batteryLevel === undefined) {
    return <div className="text-xs text-gray-400 italic">no battery data</div>;
  }

  const glow = getGlowColor(batteryLevel);
  const batteryColor = getBatteryColor(batteryLevel);

  return (
    <div className="flex items-center">
      <div
        className="relative w-14 h-6 border-2 border-neutral-800 rounded-sm overflow-hidden text-white text-[10px] font-bold flex items-center justify-center bg-neutral-600 transition duration-300 hover:border-1"
        style={{
          boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = glow;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 rgba(0, 0, 0, 0)";
        }}
      >
        <div
          className={`${batteryColor} absolute top-0 left-0 h-full`}
          style={{ width: `${batteryLevel}%` }}
        />
        <span className="z-10">{batteryLevel}%</span>
        <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-1.5 h-3 bg-neutral-600 rounded-sm" />
      </div>
      <div className="w-1 h-2 bg-neutral-800 rounded-sm" />
    </div>
  );
};

export { getBatteryColor, getGlowColor };
