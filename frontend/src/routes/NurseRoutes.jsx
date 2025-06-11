import React from "react";
import { Route } from "react-router-dom";
import NurseDashboard from "../Pages/Nurse/NurseDashboard";
import ProtectedRoute from "../components/ProtectedRoute";

// Layout riêng cho y tá (không có header, footer hoặc navigation chung)
const AdminLayout = ({ children }) => (
  <div className="admin-layout">{children}</div>
);

const NurseRoutes = () => {
  return [
    <Route
      key="nurse-dashboard"
      path="/nurse/*"
      element={
        <ProtectedRoute allowedRoles={["NURSE"]}>
          <AdminLayout>
            <NurseDashboard />
          </AdminLayout>
        </ProtectedRoute>
      }
    />,
  ];
};

export default NurseRoutes;
