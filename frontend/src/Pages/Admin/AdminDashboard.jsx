import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import DashboardContent from "./components/Dashboard/Dashboard";
import UserManagement from "./components/UserManagement/UserManagement";
import PermissionsManagement from "./components/Permissions/PermissionsManagement";
import ReportGenerator from "./components/Reports/ReportGenerator";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Render appropriate content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />;
      case "users":
        return <UserManagement />;
      case "permissions":
        return <PermissionsManagement />;
      case "reports":
        return <ReportGenerator />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Header user={currentUser} />

      <div className="admin-container">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userRole={currentUser?.role || "admin"}
        />
        <main className="admin-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
