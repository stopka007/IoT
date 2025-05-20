import React from "react";

const DoubleChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
    className={className}
  >
    <polyline points="18 19 12 12 18 5" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="12 19 6 12 12 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default DoubleChevronLeftIcon;
