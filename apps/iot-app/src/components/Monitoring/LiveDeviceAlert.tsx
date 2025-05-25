import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useWebSocket } from "../../context/WebSocketContext";

type DeviceUpdate = {
  id: string;
  help_needed: boolean;
  updatedAt: string;
};

export default function LiveDeviceAlert({ filterByDeviceId }: { filterByDeviceId?: string }) {
  const { lastUpdate } = useWebSocket();
  const [log, setLog] = useState<DeviceUpdate[]>([]);
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (!lastUpdate) return;

    // Pokud chceme filtrovat podle konkrétního zařízení
    if (filterByDeviceId && lastUpdate.id !== filterByDeviceId) return;

    // Neopakuj stejnou zprávu znovu
    if (prevId.current === `${lastUpdate.id}_${lastUpdate.updatedAt}`) return;

    prevId.current = `${lastUpdate.id}_${lastUpdate.updatedAt}`;

    // Přidat do logu
    setLog((prev) => [lastUpdate, ...prev].slice(0, 5));

    // Zobrazit toast
    if (lastUpdate.help_needed) {
      toast.error(`🚨 Zařízení ${lastUpdate.id} potřebuje pomoc!`, {
        duration: 5000,
      });
    } else {
      toast.success(`✅ Zařízení ${lastUpdate.id} už je v pořádku.`);
    }
  }, [lastUpdate, filterByDeviceId]);

  return (
    <div style={{ padding: "1rem", backgroundColor: "#f8f8f8", borderRadius: "8px" }}>
      <h3>🧾 Poslední změny zařízení:</h3>
      {log.length === 0 && <p>Žádné změny zatím nedorazily.</p>}
      <ul>
        {log.map((update, index) => (
          <li key={index}>
            [{new Date(update.updatedAt).toLocaleTimeString()}] Zařízení <b>{update.id}</b> –{" "}
            {update.help_needed ? (
              <span style={{ color: "red", fontWeight: "bold" }}>Potřebuje pomoc</span>
            ) : (
              <span style={{ color: "green" }}>OK</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
