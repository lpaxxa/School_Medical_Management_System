import React, { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
// Correct paths:
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
// Updated paths for moved components:
import "./AdminDashboard.css";
import {
  FaChild,
  FaCalendarCheck,
  FaUserMd,
  FaClipboardList,
} from "react-icons/fa";

// Chuyển đổi AdminDashboard thành component nội dung
const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Dữ liệu mẫu cho dashboard
  const stats = {
    totalStudents: 1250,
    totalMedicalEvents: 15,
    upcomingEvents: 3,
    pendingReports: 8,
    newAlerts: 5,
  };

  // Dữ liệu biểu đồ mẫu - trong thực tế sẽ lấy từ API
  const recentEvents = [
    {
      id: 1,
      title: "Kiểm tra sức khỏe định kỳ Lớp 1A",
      date: "20/06/2025",
      type: "health-check",
      status: "completed",
    },
    {
      id: 2,
      title: "Tiêm chủng vắc-xin HPV",
      date: "15/06/2025",
      type: "vaccination",
      status: "completed",
    },
    {
      id: 3,
      title: "Khám sàng lọc răng miệng",
      date: "10/06/2025",
      type: "screening",
      status: "completed",
    },
    {
      id: 4,
      title: "Hướng dẫn vệ sinh cá nhân",
      date: "05/06/2025",
      type: "education",
      status: "completed",
    },
  ];

  // Cảnh báo y tế
  const healthAlerts = [
    {
      id: 1,
      title: "Cảnh báo dịch cúm mùa",
      severity: "medium",
      date: "24/06/2025",
      description:
        "Phát hiện một số ca cúm mùa trong khu vực, cần theo dõi và thực hiện biện pháp phòng ngừa.",
    },
    {
      id: 2,
      title: "Học sinh có triệu chứng sốt",
      severity: "high",
      date: "23/06/2025",
      description: "5 học sinh lớp 3B báo cáo có triệu chứng sốt và đau họng.",
    },
    {
      id: 3,
      title: "Nhắc nhở kiểm tra sức khỏe",
      severity: "low",
      date: "22/06/2025",
      description:
        "Lớp 2C cần hoàn thành kiểm tra sức khỏe định kỳ trong tuần này.",
    },
  ];

  // Render appropriate content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            <div className="dashboard-header">
              <h1>Tổng quan Y tế học đường</h1>
              <p>Xin chào! Đây là tổng quan hoạt động y tế của trường.</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon students">
                  <FaChild />
                </div>
                <div className="stat-details">
                  <h3>Tổng số học sinh</h3>
                  <p className="stat-value">{stats.totalStudents}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon events">
                  <FaCalendarCheck />
                </div>
                <div className="stat-details">
                  <h3>Sự kiện y tế năm nay</h3>
                  <p className="stat-value">{stats.totalMedicalEvents}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon upcoming">
                  <FaUserMd />
                </div>
                <div className="stat-details">
                  <h3>Sự kiện sắp tới</h3>
                  <p className="stat-value">{stats.upcomingEvents}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon reports">
                  <FaClipboardList />
                </div>
                <div className="stat-details">
                  <h3>Báo cáo chờ xử lý</h3>
                  <p className="stat-value">{stats.pendingReports}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-row">
              {/* Recent Medical Events */}
              <div className="dashboard-card events-list">
                <div className="card-header">
                  <h2>Sự kiện y tế gần đây</h2>
                  <button className="view-all-btn">Xem tất cả</button>
                </div>
                <div className="card-content">
                  <table className="events-table">
                    <thead>
                      <tr>
                        <th>Tên sự kiện</th>
                        <th>Ngày</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((event) => (
                        <tr key={event.id}>
                          <td>{event.title}</td>
                          <td>{event.date}</td>
                          <td>
                            <span className={`status-badge ${event.status}`}>
                              {event.status === "completed"
                                ? "Hoàn thành"
                                : event.status === "upcoming"
                                ? "Sắp diễn ra"
                                : event.status === "in-progress"
                                ? "Đang diễn ra"
                                : "Tạm hoãn"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Health Alerts */}
              <div className="dashboard-card alerts-list">
                <div className="card-header">
                  <h2>Cảnh báo y tế</h2>
                  <button className="view-all-btn">Xem tất cả</button>
                </div>
                <div className="card-content">
                  <div className="alerts">
                    {healthAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`alert-item ${alert.severity}`}
                      >
                        <div className="alert-header">
                          <h3>{alert.title}</h3>
                          <span className="alert-date">{alert.date}</span>
                        </div>
                        <p className="alert-description">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "users":
        return <UserManagement />;
      case "permissions":
        return <PermissionsManagement />;
      case "reports":
        return <ReportGenerator />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Header user={currentUser} />

      <div className="admin-container">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userRole={currentUser?.role || "admin"}
        />
        <main className="admin-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
