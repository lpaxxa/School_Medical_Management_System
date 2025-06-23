import React from "react";
import { Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login";
import OAuthCallback from "../components/OAuthCallback";
import AdminRoutes from "./AdminRoutes";
import NurseRoutes from "./NurseRoutes";
import ParentRoutes from "./ParentRoutes";

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

    // OAuth callback routes (matching backend redirects)
    <Route
      key="oauth-callback"
      path="/auth/oauth2/callback"
      element={<OAuthCallback />}
    />,
    <Route
      key="oauth-failure"
      path="/auth/oauth2/failure"
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
