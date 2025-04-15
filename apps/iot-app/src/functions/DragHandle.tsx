import React, { useRef } from "react";

interface DragHandleProps {
  setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
}

const DragHandle: React.FC<DragHandleProps> = ({ setSidebarWidth }) => {
  const isDragging = useRef(false);

  const startDrag = () => {
    isDragging.current = true;

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const newWidth = Math.max(150, Math.min(e.clientX, 500));
        setSidebarWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      onMouseDown={startDrag}
      className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize bg-gray-500 opacity-30 hover:opacity-60"
      title="Drag to resize"
    />
  );
};

export default DragHandle;
