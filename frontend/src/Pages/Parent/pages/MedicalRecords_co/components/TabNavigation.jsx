import React from "react";
import {
  FaHeartbeat,
  FaCalendarCheck,
  FaSyringe,
  FaBandAid,
  FaChartLine,
} from "react-icons/fa";

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="tab-navigation">
      <div className="tab-nav-list">
        <button
          className={`tab-nav-button ${
            activeTab === "general" ? "active" : ""
          }`}
          onClick={() => onTabChange("general")}
        >
          <FaHeartbeat className="tab-nav-icon" />
          <span className="tab-nav-text">Tổng quan</span>
        </button>

        <button
          className={`tab-nav-button ${
            activeTab === "checkups" ? "active" : ""
          }`}
          onClick={() => onTabChange("checkups")}
        >
          <FaCalendarCheck className="tab-nav-icon" />
          <span className="tab-nav-text">Kiểm tra sức khỏe định kỳ</span>
        </button>

        <button
          className={`tab-nav-button ${
            activeTab === "vaccinations" ? "active" : ""
          }`}
          onClick={() => onTabChange("vaccinations")}
        >
          <FaSyringe className="tab-nav-icon" />
          <span className="tab-nav-text">Tiêm chủng</span>
        </button>

        <button
          className={`tab-nav-button ${
            activeTab === "incidents" ? "active" : ""
          }`}
          onClick={() => onTabChange("incidents")}
        >
          <FaBandAid className="tab-nav-icon" />
          <span className="tab-nav-text">Sự cố y tế</span>
        </button>

        <button
          className={`tab-nav-button ${activeTab === "growth" ? "active" : ""}`}
          onClick={() => onTabChange("growth")}
        >
          <FaChartLine className="tab-nav-icon" />
          <span className="tab-nav-text">Tăng trưởng</span>
        </button>
      </div>
    </nav>
  );
};

export default TabNavigation;
