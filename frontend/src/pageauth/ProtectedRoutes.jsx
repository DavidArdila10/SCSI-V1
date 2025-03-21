import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthUser from "./AuthUser";

const ProtectedRoutes = () => {
  const { getToken } = AuthUser();

  // Si no hay token, redirige al login
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, renderiza las rutas protegidas
  return <Outlet />;
};

export default ProtectedRoutes;
