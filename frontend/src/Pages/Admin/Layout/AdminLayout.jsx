import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserManagement from "../pages/UserManagement/UserManagement";
import PermissionManagement from "../pages/PermissionManagement/PermissionManagement";
import Reports from "../pages/Reports/Reports";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { currentUser } = useAuth();

  const handleSectionChange = (section) => {
    console.log("Navigation triggered: ", section);
    setActiveSection(section);
  };

  const renderContent = () => {
    console.log("Rendering content for section:", activeSection);

    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        console.log("Rendering UserManagement component");
        return <UserManagement />;
      case "permissions":
        return <PermissionManagement />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-layout">
      <Header user={currentUser} />
      <div className="admin-main">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          userRole={currentUser?.role || "admin"}
        />
        <main className="admin-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
