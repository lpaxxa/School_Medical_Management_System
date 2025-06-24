import React from 'react';
import { 
  FaHeartbeat, 
  FaCalendarCheck, 
  FaSyringe, 
  FaBandAid, 
  FaChartLine 
} from 'react-icons/fa';

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="medical-nav-tabs">
      <button
        className={`tab-button ${activeTab === "general" ? "active" : ""}`}
        onClick={() => onTabChange("general")}
      >
        <FaHeartbeat />
        <span>Tổng quan</span>
      </button>

      <button
        className={`tab-button ${activeTab === "checkups" ? "active" : ""}`}
        onClick={() => onTabChange("checkups")}
      >
        <FaCalendarCheck />
        <span>Kiểm tra định kỳ</span>
      </button>

      <button
        className={`tab-button ${activeTab === "vaccinations" ? "active" : ""}`}
        onClick={() => onTabChange("vaccinations")}
      >
        <FaSyringe />
        <span>Tiêm chủng</span>
      </button>

      <button
        className={`tab-button ${activeTab === "incidents" ? "active" : ""}`}
        onClick={() => onTabChange("incidents")}
      >
        <FaBandAid />
        <span>Sự cố y tế</span>
      </button>

      <button
        className={`tab-button ${activeTab === "growth" ? "active" : ""}`}
        onClick={() => onTabChange("growth")}
      >
        <FaChartLine />
        <span>Biểu đồ tăng trưởng</span>
      </button>
    </div>
  );
};

export default TabNavigation;