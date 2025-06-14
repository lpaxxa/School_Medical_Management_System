import React, { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
// Correct paths:
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
// Updated paths for moved components:
import DashboardContent from "../../pages/Dashboard_co/Dashboard";
import UserManagement from "../../pages/UserManagement_co/UserManagement";
import PermissionsManagement from "../../pages/Permissions_co/PermissionsManagement";
import ReportGenerator from "../../pages/Reports_co/ReportGenerator";
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
