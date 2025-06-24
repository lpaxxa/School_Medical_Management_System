import React from "react";
import { Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login";
import AdminRoutes from "./AdminRoutes";
import NurseRoutes from "./NurseRoutes";
import ParentRoutes from "./ParentRoutes";
import OAuthCallback from "../components/OAuthCallback";

// Define base routes and auth redirect logic in one place
const AppRoutes = ({ currentUser }) => {
  // Hàm điều hướng dựa trên vai trò
  const redirectBasedOnRole = () => {
    if (!currentUser) return <Navigate to="/login" replace />;

    switch (currentUser.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "nurse":
        return <Navigate to="/nurse" replace />;
      case "parent":
        return <Navigate to="/parent" replace />;
      default:
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

    // OAuth2 callback route (matches backend redirect)
    <Route
      key="oauth2-callback"
      path="/auth/oauth2/callback"
      element={<OAuthCallback />}
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
