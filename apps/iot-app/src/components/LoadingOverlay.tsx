import React from "react";

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent" />
    </div>
  );
};

export default LoadingOverlay;
