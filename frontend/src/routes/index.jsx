import React from "react";
import { Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login";
import AdminRoutes from "./AdminRoutes";
import NurseRoutes from "./NurseRoutes";
import ParentRoutes from "./ParentRoutes";

// Define base routes and auth redirect logic in one place
const AppRoutes = ({ currentUser }) => {
  // Hàm điều hướng dựa trên vai trò
  const redirectBasedOnRole = () => {
    if (!currentUser) return <Navigate to="/login" replace />;

    const role = currentUser.role?.toUpperCase();
    switch (role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "NURSE":
        return <Navigate to="/nurse" replace />;
      case "PARENT":
        return <Navigate to="/parent" replace />;
      default:
        console.warn("Unknown role:", currentUser.role);
        return <Navigate to="/login" replace />;
    }
  };

  return [
    // Login page route
    <Route
      key="login"
      path="/login"
      element={currentUser ? redirectBasedOnRole() : <Login />}
    />,

    // Root redirect
    <Route key="root" path="/" element={redirectBasedOnRole()} />,

    // Include role-based routes
    ...AdminRoutes(),
    ...NurseRoutes(),
    ...ParentRoutes(),

    // Catch-all route
    <Route key="not-found" path="*" element={redirectBasedOnRole()} />,
  ];
};

export default AppRoutes;
