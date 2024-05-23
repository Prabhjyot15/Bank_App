import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Ensure you adjust the path as needed
const ProtectedRoute = ({ redirectPath = "/details" }) => {
  const { user, token } = useAuth();

  if (!user || !token) {
    // If there is no user or token in the context, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
