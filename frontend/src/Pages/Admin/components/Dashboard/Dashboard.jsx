import React from "react";
import { useAuth } from "../../../../context/AuthContext";
import StatsCards from "./StatsCards";
import RecentActivities from "./RecentActivities";
import SystemNotifications from "./SystemNotifications";
import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="admin-welcome">
        <h2>Xin chào, {currentUser?.name}!</h2>
        <p>Chào mừng đến với hệ thống quản trị Y tế học đường.</p>
      </div>

      <StatsCards />

      <div className="admin-recent">
        <RecentActivities />
        <SystemNotifications />
      </div>
    </div>
  );
};

export default Dashboard;
