import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../components/Sidebar/Sidebar";
import Dashboard from "../pages/Dashboard_co/Dashboard";
import UserManagement from "../pages/UserManagement";
import { PlanManager } from "../pages/MedicalEventPlanning";
import Reports from "../pages/Reports_co/index.jsx";
import Notifications from "../pages/EmailManagement_co/Notifications";
import ArticleManagement from "../pages/ArticleManagement";
import ModernUIShowcase from "../components/ModernUIShowcase";
import "../styles/modern-theme.css";
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
      case "notifications":
        return <Notifications />;
      case "reports":
        return <Reports />;
      case "articles":
        return <ArticleManagement />;
      case "ui-showcase":
        return <ModernUIShowcase />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin_ui_layout">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userRole={currentUser?.role || "admin"}
        user={currentUser}
      />
      <div className="admin_ui_main">
        <main className="admin_ui_content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
