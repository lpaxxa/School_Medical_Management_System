import React from "react";
import { Route } from "react-router-dom";
import AdminDashboard from "../Pages/Admin/components/AdminHome/AdminDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import { AdminLayout } from "../components/layouts/SharedLayouts";

const AdminRoutes = () => {
  return [
    <Route
      key="admin-dashboard"
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      }
    />,
  ];
};

export default AdminRoutes;
