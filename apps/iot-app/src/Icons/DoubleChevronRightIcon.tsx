import React from "react";

const DoubleChevronRightIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
    className={className}
  >
    <polyline points="6 5 12 12 6 19" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="12 5 18 12 12 19" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default DoubleChevronRightIcon;
