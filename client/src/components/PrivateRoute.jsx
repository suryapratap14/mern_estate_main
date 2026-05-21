import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles = ["user", "agent", "admin"] }) => {
  const { currentUser } = useSelector((state) => state.user);
  if (!currentUser) return <Navigate to="/sign-in" replace />;
  const role = currentUser?.role || currentUser?.data?.role;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default PrivateRoute;
