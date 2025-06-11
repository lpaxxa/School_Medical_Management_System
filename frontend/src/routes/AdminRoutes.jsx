import React from "react";
import { Route } from "react-router-dom";
import AdminDashboard from "../Pages/Admin/Layout/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { AdminLayout } from "../components/layouts/SharedLayouts";

const AdminRoutes = () => {
  return [
    <Route
      key="admin-dashboard"
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      }
    />,
  ];
};

export default AdminRoutes;
