import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./NurseDashboard.css";

const NurseDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="nurse-dashboard">
      <header className="nurse-header">
        <div className="nurse-header-left">
          <h1>Hệ thống Y tá Trường học</h1>
        </div>
        <div className="nurse-header-right">
          <div className="nurse-user-info">
            <span>Xin chào, {currentUser?.name}</span>
            <button className="nurse-logout-button" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="nurse-container">
        <aside className="nurse-sidebar">
          <ul className="nurse-menu">
            <li
              className={`nurse-menu-item ${
                activeTab === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </li>
            <li
              className={`nurse-menu-item ${
                activeTab === "students" ? "active" : ""
              }`}
              onClick={() => setActiveTab("students")}
            >
              <i className="fas fa-user-graduate"></i>
              <span>Học sinh</span>
            </li>
            <li
              className={`nurse-menu-item ${
                activeTab === "health-records" ? "active" : ""
              }`}
              onClick={() => setActiveTab("health-records")}
            >
              <i className="fas fa-file-medical"></i>
              <span>Hồ sơ Y tế</span>
            </li>
            <li
              className={`nurse-menu-item ${
                activeTab === "check-ups" ? "active" : ""
              }`}
              onClick={() => setActiveTab("check-ups")}
            >
              <i className="fas fa-stethoscope"></i>
              <span>Khám sức khỏe</span>
            </li>
            <li
              className={`nurse-menu-item ${
                activeTab === "medicine" ? "active" : ""
              }`}
              onClick={() => setActiveTab("medicine")}
            >
              <i className="fas fa-pills"></i>
              <span>Quản lý thuốc</span>
            </li>
            <li
              className={`nurse-menu-item ${
                activeTab === "schedule" ? "active" : ""
              }`}
              onClick={() => setActiveTab("schedule")}
            >
              <i className="fas fa-calendar-alt"></i>
              <span>Lịch trực</span>
            </li>
          </ul>
        </aside>

        <main className="nurse-content">
          <div className="nurse-welcome">
            <h2>Xin chào, {currentUser?.name}!</h2>
            <p>
              Ngày hôm nay là ngày {new Date().toLocaleDateString("vi-VN")}.
            </p>
          </div>

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
      </div>
    </div>
  );
};

export default NurseDashboard;
