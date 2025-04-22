import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import GreaterThanIcon from "../../Icons/GreaterThanIcon";
import { useTheme } from "../../functions/ThemeContext";
import { mockUsers } from "../data";

const Breadcrumbs: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const baseText = theme === "light" ? "text-black" : "text-white";
  const hoverText =
    theme === "light"
      ? "hover:bg-gray-600 p-2 rounded hover:text-white transition duration-300 ease-in-out"
      : "hover:bg-neutral-400 p-2 rounded hover:text-black transition duration-300 ease-in-out";
  const headerClass =
    theme === "light"
      ? "bg-gray-100 text-black border-gray-300"
      : "bg-neutral-600 text-white border-white/20";

  const patientName = mockUsers.find(p => p.id === id)?.name;

  const isOnPatientDetail = location.pathname.startsWith("/patient-detail/") && patientName;

  return (
    <nav className={`flex px-5 py-3 ${headerClass}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className={`inline-flex items-center text-sm font-medium ${baseText} ${hoverText}`}
          >
            <svg
              className="w-3 h-3 me-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
            </svg>
            Domů
          </Link>
        </li>

        {isOnPatientDetail && (
          <li className="flex items-center">
            <GreaterThanIcon />
            <span className={`ms-1 text-sm font-medium ${baseText}`}>{patientName}</span>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
