import React from "react";
import { Navigate, Outlet } from "react-router-dom";

import LoadingOverlay from "../components/LoadingOverlay";

import { useAuth } from "./context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: Array<"admin" | "user">;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
