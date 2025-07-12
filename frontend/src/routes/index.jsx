import React from "react";
import { Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login";
// import AdminRoutes from "./AdminRoutes"; // TODO: Temporarily disabled Admin routes
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
        // TODO: Temporarily redirect admin to nurse dashboard while Admin module is disabled
        console.warn(
          "Admin module is temporarily disabled. Redirecting to nurse dashboard."
        );
        return <Navigate to="/nurse" replace />;
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

    <Route
      key="oauth2-callback"
      path="/auth/oauth2/callback"
      element={<OAuthCallback />}
    />,

    // Root redirect
    <Route key="root" path="/" element={redirectBasedOnRole()} />,

    // Include role-based routes
    // ...AdminRoutes(), // TODO: Temporarily disabled Admin routes
    ...NurseRoutes(),
    ...ParentRoutes(),

    // Catch-all route
    <Route key="not-found" path="*" element={redirectBasedOnRole()} />,
  ];
};

export default AppRoutes;
