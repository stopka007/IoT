import React, { useEffect, useState } from "react";

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

// Cache for battery levels
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

  // Theme-based styling
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

  useEffect(() => {
    let filteredResults = [...patients];

    // Apply room filtering
    if (selectedRooms.length > 0) {
      filteredResults = filteredResults.filter(p => selectedRooms.includes(p.room));
    }

    // Apply name sorting (A-Z or Z-A)
    if (!batteryFilter) {
      filteredResults.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        return sortOrder === "A-Z" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    }
    // Apply battery sorting
    else if (Object.keys(batteryLevels).length > 0) {
      filteredResults.sort((a, b) => {
        const batteryA = batteryLevels[a.id_device] || 0;
        const batteryB = batteryLevels[b.id_device] || 0;

        return batteryFilter === "Nejnižší"
          ? batteryA - batteryB // Ascending order for lowest first
          : batteryB - batteryA; // Descending order for highest first
      });
    }

    onFilterChange(filteredResults);
  }, [patients, selectedRooms, sortOrder, batteryFilter, batteryLevels, onFilterChange]);

  const toggleRoomSelection = (room: number) => {
    setSelectedRooms(prev =>
      prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room],
    );
  };
  useEffect(() => {
    const storedRooms = localStorage.getItem("filter_selectedRooms");
    const storedBattery = localStorage.getItem("filter_batteryFilter");
    const storedSortOrder = localStorage.getItem("filter_sortOrder");

    if (storedRooms) {
      try {
        setSelectedRooms(JSON.parse(storedRooms));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        console.warn("Nepodařilo se načíst rooms z localStorage");
      }
    }

    if (storedBattery && (storedBattery === "Nejvyšší" || storedBattery === "Nejnižší")) {
      setBatteryFilter(storedBattery as BatteryFilter);
    }

    if (storedSortOrder && (storedSortOrder === "A-Z" || storedSortOrder === "Z-A")) {
      setSortOrder(storedSortOrder as SortOrder);
    }
  }, []);
  const handleSortOrderChange = (order: SortOrder) => {
    setSortOrder(order);
    setBatteryFilter(null); // Clear battery filter when sorting by name
  };

  const handleBatteryFilterChange = (filter: BatteryFilter) => {
    setBatteryFilter(filter);
  };
  useEffect(() => {
    localStorage.setItem("filter_selectedRooms", JSON.stringify(selectedRooms));
  }, [selectedRooms]);

  useEffect(() => {
    localStorage.setItem("filter_batteryFilter", batteryFilter || "");
  }, [batteryFilter]);

  useEffect(() => {
    localStorage.setItem("filter_sortOrder", sortOrder);
  }, [sortOrder]);

  // Determine the content panel based on active category
  const renderContentPanel = () => {
    if (!activeCategory) {
      return null;
    }

    // Patient sorting (A-Z/Z-A)
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

    // Room selection checkboxes
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

    // Battery status options
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

  // Calculate active filtering status
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

      {/* Summary + clear */}
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
