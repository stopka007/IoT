import React from "react";

type UserWithBattery = {
  name: string;
  battery: number;
  isActive: boolean;
};

const mockUsers: UserWithBattery[] = [
  "Patient 1",
  "Patient 2",
  "Patient 3",
  "Patient 4",
  "Patient 5",
  "Patient 6",
  "Patient 7",
  "Patient 8",
  "Patient 9",
  "Patient 10",
].map(name => ({
  name,
  battery: Math.floor(Math.random() * 100) + 1,
  isActive: Math.random() > 0.5, // náhodně aktivní nebo neaktivní
}));

const getBatteryColor = (level: number): string => {
  if (level < 20) return "bg-red-500";
  if (level < 50) return "bg-yellow-400";
  if (level < 80) return "bg-green-400";
  return "bg-green-600";
};

export default function MainPage() {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-400">
          <h2 className="text-2xl font-semibold mb-2">Users</h2>
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 rounded bg-white border border-gray-400 text-sm"
          />
        </div>

        {/* User list */}
        <ul className="flex-1 overflow-y-auto">
          {mockUsers.map((user, index) => (
            <li
              key={index}
              className="border-b border-white px-4 py-2 flex justify-between items-center hover:bg-gray-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {/* Stav tečky */}
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.isActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                  title={user.isActive ? "Active" : "Inactive"}
                />
                <span>{user.name}</span>
              </div>

              {/* Baterie */}
              <div className="flex items-center gap-1">
                <div className="relative w-14 h-6 border-2 border-gray-600 rounded-sm overflow-hidden text-white text-[10px] font-bold flex items-center justify-center">
                  <div
                    className={`${getBatteryColor(user.battery)} absolute top-0 left-0 h-full`}
                    style={{ width: `${user.battery}%` }}
                  />
                  <span className="z-10">{user.battery}%</span>
                  <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-1.5 h-3 bg-gray-600 rounded-sm" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-gray-100 text-center text-2xl font-medium py-4 border-b border-gray-300">
          Header
        </header>
        <div className="flex-1 bg-white">{/* Main area content */}</div>
      </main>
    </div>
  );
}
