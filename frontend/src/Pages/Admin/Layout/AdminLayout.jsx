import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Dashboard from "../pages/Dashboard_co/Dashboard";
import UserManagement from "../pages/UserManagement_co/UserManagement";
import PermissionManagement from "../pages/Permissions_co/PermissionsManagement";
import VaccinationManagement from "../pages/Vaccination_co/VaccinationManagement";
import CheckupManagement from "../pages/Checkups_co/CheckupManagement";
import Reports from "../pages/Reports_co";
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
      case "vaccination":
        return <VaccinationManagement />;
      case "checkups":
        return <CheckupManagement />;
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
