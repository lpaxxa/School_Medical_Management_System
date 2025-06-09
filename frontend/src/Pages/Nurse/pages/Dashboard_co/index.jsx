import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import InventoryManagement from "../../components/Inventory";
import MedicalEventsManagement from "../../components/MedicalEvents";
import VaccinationManagement from "../../components/Vaccination";
import StudentRecords from "../../components/StudentRecords";
import ConsultationManagement from "../../components/Consultation";
import HealthCheckups from "../../components/HealthCheckups";
import DebugComponent from "../../components/Debug/DebugComponent";
import "./index.css";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Log when component mounts
  useEffect(() => {
    console.log("NurseDashboard mounted");
    console.log("Current user:", currentUser);
  }, [currentUser]);

  // Xác định tiêu đề dựa trên tab đang active
  const getPageTitle = () => {
    switch(activeTab) {
      case "inventory":
        return "Quản lý kho";
      case "medical-events":
        return "Sự kiện y tế";
      case "vaccination":
        return "Quản lý tiêm chủng";
      case "health-checkups":
        return "Khám sức khỏe định kỳ";
      case "student-records":
        return "Hồ sơ y tế học sinh";
      case "consultation":
        return "Hỗ trợ tư vấn";
      case "blog-management":
        return "Quản lý blog";
      default:
        return "";
    }
  };

  const dashboardContent = (
    <>
      {/* Page title - only appears for specific tabs */}
      {getPageTitle() && (
        <div className="page-title-container">
          <h2>{getPageTitle()}</h2>
        </div>
      )}

      {/* Main content area */}
      <div className="content-container">
        {activeTab === "dashboard" && (
          <main className="dashboard-content">
            {/* Dashboard content */}
            <div className="nurse-welcome">
              <h2>Xin chào, {currentUser?.name || "Y tá"}!</h2>
              <p>
                Ngày hôm nay là ngày {new Date().toLocaleDateString("vi-VN")}.
              </p>
              
              {/* Debug component */}
              <DebugComponent />
            </div>

            {/* Dashboard overview cards */}
            <div className="nurse-overview">
              <div className="overview-card today-visits">
                <div className="overview-icon">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <div className="overview-info">
                  <h3>12</h3>
                  <p>Lượt khám hôm nay</p>
                </div>
              </div>

              <div className="overview-card pending">
                <div className="overview-icon">
                  <i className="fas fa-user-clock"></i>
                </div>
                <div className="overview-info">
                  <h3>5</h3>
                  <p>Học sinh đang chờ</p>
                </div>
              </div>

              <div className="overview-card reports">
                <div className="overview-icon">
                  <i className="fas fa-file-medical-alt"></i>
                </div>
                <div className="overview-info">
                  <h3>8</h3>
                  <p>Báo cáo cần gửi</p>
                </div>
              </div>

              <div className="overview-card alerts">
                <div className="overview-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="overview-info">
                  <h3>2</h3>
                  <p>Cảnh báo sức khỏe</p>
                </div>
              </div>
            </div>

            <div className="nurse-sections">
              <div className="nurse-section">
                <h3>Danh sách học sinh cần khám hôm nay</h3>
                <div className="student-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Họ và tên</th>
                        <th>Lớp</th>
                        <th>Thời gian</th>
                        <th>Lý do</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Nguyễn Văn An</td>
                        <td>10A1</td>
                        <td>08:30</td>
                        <td>Sốt nhẹ</td>
                        <td>
                          <span className="status waiting">Đang chờ</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Trần Thị Bình</td>
                        <td>11A2</td>
                        <td>09:15</td>
                        <td>Đau đầu</td>
                        <td>
                          <span className="status in-progress">Đang khám</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Lê Hoàng Công</td>
                        <td>12B3</td>
                        <td>10:00</td>
                        <td>Kiểm tra định kỳ</td>
                        <td>
                          <span className="status waiting">Đang chờ</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Phạm Thị Diệu</td>
                        <td>9C2</td>
                        <td>10:30</td>
                        <td>Đau bụng</td>
                        <td>
                          <span className="status waiting">Đang chờ</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Hoàng Văn Duy</td>
                        <td>8A1</td>
                        <td>11:00</td>
                        <td>Vết thương nhỏ</td>
                        <td>
                          <span className="status waiting">Đang chờ</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="nurse-section">
                <h3>Thông báo gần đây</h3>
                <ul className="notification-list">
                  <li>
                    <div className="notification-time">09:45</div>
                    <div className="notification-content">
                      <strong>Y tá trưởng:</strong> Vui lòng cập nhật hồ sơ khám
                      sức khỏe của các học sinh lớp 10A.
                    </div>
                  </li>
                  <li>
                    <div className="notification-time">Hôm qua</div>
                    <div className="notification-content">
                      <strong>Hệ thống:</strong> Đã đến lịch kiểm tra vaccine định
                      kỳ cho học sinh khối 7.
                    </div>
                  </li>
                  <li>
                    <div className="notification-time">24/05</div>
                    <div className="notification-content">
                      <strong>Ban giám hiệu:</strong> Họp giao ban công tác y tế
                      học đường vào 14h ngày 27/05.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </main>
        )}
        
        {/* Các chức năng đã hoàn thành */}
        {activeTab === "inventory" && <InventoryManagement />}
        {activeTab === "medical-events" && <MedicalEventsManagement />}
        {activeTab === "vaccination" && <VaccinationManagement />}
        {activeTab === "student-records" && <StudentRecords />}
        {activeTab === "consultation" && <ConsultationManagement />}
        {activeTab === "health-checkups" && <HealthCheckups />}
        
        {/* Các chức năng chưa hoàn thành */}
        {activeTab === "blog-management" && (
          <main className="nurse-content">
            <div className="placeholder-content">
              <h3>Nội dung cho {getPageTitle()} đang được phát triển</h3>
              <p>Chức năng này sẽ được cập nhật trong thời gian tới.</p>
            </div>
          </main>
        )}
      </div>
    </>
  );

  return (
    <div className="nurse-dashboard">
      {dashboardContent}
    </div>
  );
};

export default Dashboard;
