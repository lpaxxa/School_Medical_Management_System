import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  // Mock data
  const stats = [
    {
      id: 1,
      label: "Tổng số học sinh",
      value: 1234,
      icon: "fas fa-users",
      color: "#4361ee",
    },
    {
      id: 2,
      label: "Báo cáo y tế hôm nay",
      value: 15,
      icon: "fas fa-notes-medical",
      color: "#3498db",
    },
    {
      id: 3,
      label: "Báo cáo sức khỏe",
      value: 45,
      icon: "fas fa-file-medical-alt",
      color: "#2ecc71",
    },
    {
      id: 4,
      label: "Tổng số thuốc đăng ký",
      value: 28,
      icon: "fas fa-pills",
      color: "#e74c3c",
    },
  ];
  return (
    <div className="admin-dashboard-content">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Quản lý Y tế Học đường</h2>
          <p>Hệ thống quản lý sức khỏe toàn diện dành cho nhà trường</p>
          <div className="date-display">
            <i className="fas fa-calendar-day"></i> {new Date().toLocaleDateString('vi-VN', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
          </div>
        </div>
        <div className="welcome-image"></div>
      </div>
      
      <h2 className="dashboard-title">Tổng quan hệ thống</h2>      <div className="stats-container">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="stat-card"
            style={{ borderLeft: `4px solid ${stat.color}` }}
          >
            <div className="stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>
              <i className={stat.icon}></i>
            </div>            <div className="stat-info">
              <h3 className="stat-value" style={{ color: stat.color }}>{stat.value.toLocaleString()}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-widgets">
        <div className="widget">
          <h3 className="widget-title">Hoạt động gần đây</h3>
          <ul className="activity-list">
            <li>
              <span className="activity-time">10:30</span>
              <span className="activity-text">Y tá đã tạo báo cáo mới</span>
            </li>
            <li>
              <span className="activity-time">09:15</span>
              <span className="activity-text">
                Phụ huynh Nguyễn Văn A đã gửi thuốc cho con
              </span>
            </li>
            <li>
              <span className="activity-time">08:45</span>
              <span className="activity-text">
                Khai báo sức khỏe mới từ lớp 3A
              </span>
            </li>
            <li>
              <span className="activity-time">Hôm qua</span>
              <span className="activity-text">
                Cập nhật dữ liệu cho 5 học sinh
              </span>
            </li>
          </ul>
        </div>

        <div className="widget">
          <h3 className="widget-title">Thông báo hệ thống</h3>
          <ul className="notification-list">
            <li className="notification-urgent">
              <i className="fas fa-exclamation-circle"></i>
              <span>Cần phê duyệt 3 đơn thuốc mới</span>
            </li>
            <li>
              <i className="fas fa-info-circle"></i>
              <span>Hệ thống sẽ bảo trì lúc 23:00 tối nay</span>
            </li>
            <li>
              <i className="fas fa-clipboard-check"></i>
              <span>Báo cáo tháng đã sẵn sàng để xuất</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
