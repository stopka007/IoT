import React, { useCallback, useEffect, useState } from "react";

import { useTheme } from "../../functions/ThemeContext";
import { Patient } from "../../functions/patientService";

interface FilterProps {
  patients: Patient[];
  onFilterChange: (filteredPatients: Patient[]) => void;
  batteryLevels?: BatteryCache;
}

type SortOrder = "A-Z" | "Z-A";
type BatteryFilter = "Nejnižší" | "Nejvyšší";
type FilterCategory = "pacienti" | "mistnosti" | "stav-baterie";

interface BatteryCache {
  [deviceId: string]: number;
}

const Filter: React.FC<FilterProps> = ({ patients, onFilterChange, batteryLevels = {} }) => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<FilterCategory | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("A-Z");
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [batteryFilter, setBatteryFilter] = useState<BatteryFilter | null>(null);
  const [availableRooms, setAvailableRooms] = useState<number[]>([]);
  const [hasAppliedInitialFilter, setHasAppliedInitialFilter] = useState(false);

  const bgColor = theme === "light" ? "bg-white" : "bg-neutral-600";
  const textColor = theme === "light" ? "text-black" : "text-white";
  const borderColor = theme === "light" ? "border-gray-300" : "border-neutral-500";
  const activeTextColor = theme === "light" ? "text-blue-600" : "text-blue-300";

  useEffect(() => {
    if (patients.length > 0) {
      const roomNumbers = [...new Set(patients.map(p => p.room))];
      setAvailableRooms(roomNumbers.sort((a, b) => a - b));
    }
  }, [patients]);

  const applyFilter = useCallback(
    (patientsList: Patient[], rooms: number[], sort: SortOrder, battery: BatteryFilter | null) => {
      let filteredResults = [...patientsList];

      if (rooms.length > 0) {
        filteredResults = filteredResults.filter(p => rooms.includes(p.room));
      }

      if (!battery) {
        filteredResults.sort((a, b) =>
          sort === "A-Z" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
        );
      } else if (Object.keys(batteryLevels).length > 0) {
        filteredResults.sort((a, b) => {
          const batteryA = batteryLevels[a.id_device] || 0;
          const batteryB = batteryLevels[b.id_device] || 0;

          return battery === "Nejnižší" ? batteryA - batteryB : batteryB - batteryA;
        });
      }

      onFilterChange(filteredResults);
    },
    [batteryLevels, onFilterChange],
  );
  useEffect(() => {
    applyFilter(patients, selectedRooms, sortOrder, batteryFilter);
  }, [patients, selectedRooms, sortOrder, batteryFilter, batteryLevels, applyFilter]);

  // 2️⃣ až potom použij v useEffect
  useEffect(() => {
    if (patients.length > 0 && !hasAppliedInitialFilter) {
      const storedRooms = localStorage.getItem("filter_selectedRooms");
      const storedBattery = localStorage.getItem("filter_batteryFilter");
      const storedSortOrder = localStorage.getItem("filter_sortOrder");

      let parsedRooms: number[] = [];
      let parsedBattery: BatteryFilter | null = null;
      let parsedSortOrder: SortOrder = "A-Z";

      if (storedRooms) {
        try {
          parsedRooms = JSON.parse(storedRooms);
          setSelectedRooms(parsedRooms);
        } catch {
          /* empty */
        }
      }

      if (storedBattery === "Nejvyšší" || storedBattery === "Nejnižší") {
        parsedBattery = storedBattery as BatteryFilter;
        setBatteryFilter(parsedBattery);
      }

      if (storedSortOrder === "A-Z" || storedSortOrder === "Z-A") {
        parsedSortOrder = storedSortOrder as SortOrder;
        setSortOrder(parsedSortOrder);
      }

      applyFilter(patients, parsedRooms, parsedSortOrder, parsedBattery);
      setHasAppliedInitialFilter(true);
    }
  }, [patients, hasAppliedInitialFilter, applyFilter]);

  useEffect(() => {
    localStorage.setItem("filter_selectedRooms", JSON.stringify(selectedRooms));
  }, [selectedRooms]);

  useEffect(() => {
    localStorage.setItem("filter_batteryFilter", batteryFilter || "");
  }, [batteryFilter]);

  useEffect(() => {
    localStorage.setItem("filter_sortOrder", sortOrder);
  }, [sortOrder]);

  const toggleRoomSelection = (room: number) => {
    setSelectedRooms(prev =>
      prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room],
    );
  };

  const handleSortOrderChange = (order: SortOrder) => {
    setSortOrder(order);
    setBatteryFilter(null);
  };

  const handleBatteryFilterChange = (filter: BatteryFilter) => {
    setBatteryFilter(filter);
  };

  const renderContentPanel = () => {
    if (!activeCategory) return null;

    if (activeCategory === "pacienti") {
      return (
        <div className="py-2 px-4">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={() => handleSortOrderChange("A-Z")}
              className={`px-3 py-1 rounded ${
                sortOrder === "A-Z" && !batteryFilter
                  ? "bg-blue-100 light:bg-blue-900 font-medium " + activeTextColor
                  : "bg-grey-100 light:bg-neutral-600"
              }`}
            >
              A-Z
            </button>
            <button
              onClick={() => handleSortOrderChange("Z-A")}
              className={`px-3 py-1 rounded ${
                sortOrder === "Z-A" && !batteryFilter
                  ? "bg-blue-100 light:bg-blue-900 font-medium " + activeTextColor
                  : "bg-grey-100 light:bg-neutral-600"
              }`}
            >
              Z-A
            </button>
          </div>
        </div>
      );
    }

    if (activeCategory === "mistnosti") {
      if (availableRooms.length === 0) {
        return <div className="py-2 px-4 text-sm italic">Nejsou k dispozici žádné místnosti</div>;
      }

      return (
        <div className="py-2 px-4 max-h-40 overflow-y-auto">
          {availableRooms.map(room => (
            <div key={room} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`room-${room}`}
                checked={selectedRooms.includes(room)}
                onChange={() => toggleRoomSelection(room)}
                className="mr-2"
              />
              <label htmlFor={`room-${room}`} className="text-sm">
                Místnost {room}
              </label>
            </div>
          ))}
        </div>
      );
    }

    if (activeCategory === "stav-baterie") {
      return (
        <div className="py-2 px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBatteryFilterChange("Nejvyšší")}
              className={`px-3 py-1 rounded ${
                batteryFilter === "Nejvyšší"
                  ? "bg-blue-100 light:bg-blue-900 font-medium " + activeTextColor
                  : "bg-grey-100 light:bg-neutral-600"
              }`}
            >
              Největší
            </button>
            <button
              onClick={() => handleBatteryFilterChange("Nejnižší")}
              className={`px-3 py-1 rounded ${
                batteryFilter === "Nejnižší"
                  ? "bg-blue-100 light:bg-blue-900 font-medium " + activeTextColor
                  : "bg-grey-100 light:bg-neutral-600"
              }`}
            >
              Nejmenší
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`rounded-md shadow border ${borderColor} ${bgColor}`}>
      <div className="flex border-b border-gray-200 dark:border-neutral-600">
        {["pacienti", "mistnosti", "stav-baterie"].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as FilterCategory)}
            className={`px-4 py-2 text-sm flex-1 ${
              activeCategory === cat
                ? `${activeTextColor} font-medium border-b-2 border-blue-500 dark:border-blue-400`
                : `${textColor} hover:bg-neutral-600`
            }`}
          >
            {cat === "pacienti" ? "Pacienti" : cat === "mistnosti" ? "Místnosti" : "Stav baterie"}
          </button>
        ))}
      </div>

      {renderContentPanel()}

      {(selectedRooms.length > 0 || batteryFilter !== null) && (
        <div className="p-2 border-t border-gray-200 dark:border-neutral-600 flex justify-between items-center">
          <div className="text-xs">
            {selectedRooms.length > 0 && (
              <span className="mr-2">Místnosti: {selectedRooms.length}</span>
            )}
            {batteryFilter && <span>Baterie: {batteryFilter}</span>}
          </div>
          <button
            onClick={() => {
              setSelectedRooms([]);
              setBatteryFilter(null);
              setSortOrder("A-Z");
              localStorage.removeItem("filter_selectedRooms");
              localStorage.removeItem("filter_batteryFilter");
              localStorage.removeItem("filter_sortOrder");
            }}
            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300"
          >
            Vymazat filtry
          </button>
        </div>
      )}
    </div>
  );
};

export default Filter;
