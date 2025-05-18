import { useCallback } from "react";
import { useOutletContext } from "react-router-dom";

import RoomsGrid from "../RoomsComponent/RoomsGrid";

interface OutletContextType {
  onUpdate: () => void;
  key: number;
  setShowFilter: (show: boolean) => void;
}

const HomePage = () => {
  const { onUpdate, key, setShowFilter } = useOutletContext<OutletContextType>();

  const handleUpdate = useCallback(() => {
    if (onUpdate) onUpdate();
  }, [onUpdate]);

  return (
    <>
      <div className="p-6">
        <RoomsGrid key={key} onUpdate={handleUpdate} setShowFilter={setShowFilter} />
      </div>
    </>
  );
};

export default HomePage;
