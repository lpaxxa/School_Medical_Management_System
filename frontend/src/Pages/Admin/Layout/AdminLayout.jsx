import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Dashboard from "../pages/Dashboard_co/Dashboard";
import UserManagement from "../pages/UserManagement";
import { PlanManager } from "../pages/MedicalEventPlanning";
import Reports from "../pages/Reports_co/index.jsx";
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
        return <Dashboard />; // Chỉ import và render Dashboard, không phải AdminDashboard
      case "users":
        return <UserManagement />;
      case "medical-planning":
        return <PlanManager />;
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
