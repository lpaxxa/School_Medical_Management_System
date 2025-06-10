import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animateStats, setAnimateStats] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Trigger stats animation
    setTimeout(() => setAnimateStats(true), 500);

    return () => clearInterval(timer);
  }, []);

  // Enhanced admin-focused stats
  const stats = [
    {
      id: 1,
      label: "Tổng số người dùng",
      value: 1847,
      previousValue: 1805,
      icon: "fas fa-users",
      color: "#667eea",
      trend: "+2.3%",
      trendUp: true,
      detail: "847 phụ huynh, 15 y tá, 985 học sinh",
    },
    {
      id: 2,
      label: "Lớp học được quản lý",
      value: 42,
      previousValue: 40,
      icon: "fas fa-school",
      color: "#2ecc71",
      trend: "+5%",
      trendUp: true,
      detail: "Từ lớp 1 đến lớp 12",
    },
    {
      id: 3,
      label: "Hoạt động hệ thống hôm nay",
      value: 324,
      previousValue: 289,
      icon: "fas fa-chart-line",
      color: "#f39c12",
      trend: "+12.1%",
      trendUp: true,
      detail: "Đăng nhập, báo cáo, cập nhật",
    },
    {
      id: 4,
      label: "Báo cáo chờ xử lý",
      value: 8,
      previousValue: 12,
      icon: "fas fa-file-alt",
      color: "#e74c3c",
      trend: "-33.3%",
      trendUp: false,
      detail: "Báo cáo tháng và tuần",
    },
  ];

  // Admin-focused quick actions
  const quickActions = [
    {
      id: 1,
      title: "Quản lý người dùng",
      icon: "fas fa-users-cog",
      color: "#3498db",
      description: "Thêm, sửa, xóa tài khoản người dùng",
      action: "users",
    },
    {
      id: 2,
      title: "Phân quyền hệ thống",
      icon: "fas fa-shield-alt",
      color: "#9b59b6",
      description: "Gán quyền truy cập theo vai trò",
      action: "permissions",
    },
    {
      id: 3,
      title: "Xuất báo cáo tổng hợp",
      icon: "fas fa-file-export",
      color: "#2ecc71",
      description: "Tạo báo cáo Excel cho ban giám hiệu",
      action: "reports",
    },
    {
      id: 4,
      title: "Cài đặt hệ thống",
      icon: "fas fa-cogs",
      color: "#e67e22",
      description: "Cấu hình và bảo trì hệ thống",
      action: "settings",
    },
  ];

  // Administrative activities
  const recentActivities = [
    {
      id: 1,
      time: "11:45",
      text: "Tạo 5 tài khoản phụ huynh mới cho lớp 1A",
      type: "user",
      icon: "fas fa-user-plus",
      user: "Admin",
    },
    {
      id: 2,
      time: "10:30",
      text: "Xuất báo cáo tổng hợp tháng 11 cho Ban Giám hiệu",
      type: "report",
      icon: "fas fa-file-download",
      user: "Admin",
    },
    {
      id: 3,
      time: "09:15",
      text: "Cập nhật quyền truy cập cho 3 y tá mới",
      type: "permission",
      icon: "fas fa-shield-alt",
      user: "Admin",
    },
    {
      id: 4,
      time: "08:45",
      text: "Backup dữ liệu hệ thống hoàn tất",
      type: "system",
      icon: "fas fa-database",
      user: "System",
    },
    {
      id: 5,
      time: "08:20",
      text: "15 phụ huynh mới đăng ký tài khoản",
      type: "registration",
      icon: "fas fa-user-check",
      user: "System",
    },
    {
      id: 6,
      time: "Hôm qua",
      text: "Hoàn thành bảo trì hệ thống định kỳ",
      type: "maintenance",
      icon: "fas fa-tools",
      user: "Admin",
    },
  ];

  // Administrative tasks
  const upcomingTasks = [
    {
      id: 1,
      title: "Tạo báo cáo quý IV cho Sở GD&ĐT",
      deadline: "Hôm nay, 16:00",
      priority: "urgent",
      completed: false,
      category: "report",
    },
    {
      id: 2,
      title: "Phê duyệt 12 tài khoản phụ huynh mới",
      deadline: "Hôm nay, 17:30",
      priority: "high",
      completed: false,
      category: "user",
    },
    {
      id: 3,
      title: "Cập nhật phân quyền cho học kỳ mới",
      deadline: "Mai, 09:00",
      priority: "medium",
      completed: false,
      category: "permission",
    },
    {
      id: 4,
      title: "Họp review hệ thống với IT",
      deadline: "Mai, 14:00",
      priority: "medium",
      completed: false,
      category: "meeting",
    },
    {
      id: 5,
      title: "Backup dữ liệu tuần",
      deadline: "Thứ 6, 18:00",
      priority: "low",
      completed: true,
      category: "system",
    },
  ];

  // User statistics breakdown
  const userBreakdown = [
    {
      role: "Phụ huynh",
      count: 847,
      icon: "fas fa-users",
      color: "#3498db",
    },
    {
      role: "Học sinh",
      count: 985,
      icon: "fas fa-graduation-cap",
      color: "#2ecc71",
    },
    {
      role: "Y tá",
      count: 15,
      icon: "fas fa-user-nurse",
      color: "#e74c3c",
    },
    {
      role: "Quản trị viên",
      count: 3,
      icon: "fas fa-user-shield",
      color: "#f39c12",
    },
  ];

  // System performance metrics
  const systemMetrics = [
    { label: "Uptime", value: "99.8%", status: "excellent" },
    { label: "Response Time", value: "120ms", status: "good" },
    { label: "Error Rate", value: "0.02%", status: "excellent" },
    { label: "Active Sessions", value: "156", status: "normal" },
  ];

  const handleQuickAction = (action) => {
    // This would navigate to specific admin sections
    console.log(`Navigating to: ${action}`);
    // You can implement navigation logic here
  };

  return (
    <div className="admin-dashboard-content">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">
            <i className="fas fa-tachometer-alt"></i>
            Bảng điều khiển quản trị
          </h1>
          <p className="dashboard-subtitle">
            Tổng quan hệ thống quản lý sức khỏe học đường - Xin chào,{" "}
            {currentUser?.name || "Admin"}
          </p>
        </div>

        <div className="dashboard-time">
          <div className="current-time">
            <i className="fas fa-clock"></i>
            <span>{currentTime.toLocaleTimeString("vi-VN")}</span>
          </div>
          <div className="current-date">
            {currentTime.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div
            key={stat.id}
            className={`stat-card ${animateStats ? "animate" : ""}`}
            style={{
              animationDelay: `${index * 0.1}s`,
              "--stat-color": stat.color,
            }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <i className={stat.icon}></i>
              </div>
              <div className={`stat-trend ${stat.trendUp ? "up" : "down"}`}>
                <i
                  className={`fas fa-arrow-${stat.trendUp ? "up" : "down"}`}
                ></i>
                <span>{stat.trend}</span>
              </div>
            </div>

            <div className="stat-content">
              <h3 className="stat-value">
                <span className="stat-number">
                  {stat.value.toLocaleString()}
                </span>
              </h3>
              <p className="stat-label">{stat.label}</p>
              <small className="stat-detail">{stat.detail}</small>
            </div>

            <div className="stat-footer">
              <span className="stat-previous">
                So với kỳ trước: {stat.previousValue.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">
          <i className="fas fa-bolt"></i>
          Chức năng quản trị
        </h3>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="quick-action-card"
              style={{ "--action-color": action.color }}
              onClick={() => handleQuickAction(action.action)}
            >
              <div className="action-icon">
                <i className={action.icon}></i>
              </div>
              <div className="action-content">
                <h4>{action.title}</h4>
                <p>{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Recent Activities */}
        <div className="widget activities-widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <i className="fas fa-history"></i>
              Hoạt động quản trị gần đây
            </h3>
            <button className="widget-action">
              <i className="fas fa-external-link-alt"></i>
            </button>
          </div>

          <div className="widget-content">
            <div className="activities-timeline">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`activity-item ${activity.type}`}
                >
                  <div className="activity-icon">
                    <i className={activity.icon}></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">{activity.text}</div>
                    <div className="activity-meta">
                      <div className="activity-time">
                        <i className="fas fa-clock"></i>
                        {activity.time}
                      </div>
                      <div className="activity-user">
                        <i className="fas fa-user"></i>
                        {activity.user}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Administrative Tasks */}
        <div className="widget tasks-widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <i className="fas fa-tasks"></i>
              Nhiệm vụ quản trị
            </h3>
            <button className="widget-action">
              <i className="fas fa-plus"></i>
            </button>
          </div>

          <div className="widget-content">
            <div className="tasks-list">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.priority} ${
                    task.completed ? "completed" : ""
                  }`}
                >
                  <div className="task-checkbox">
                    <input type="checkbox" checked={task.completed} readOnly />
                    <span className="checkmark"></span>
                  </div>
                  <div className="task-content">
                    <h4 className="task-title">{task.title}</h4>
                    <div className="task-meta">
                      <div className="task-deadline">
                        <i className="fas fa-calendar-alt"></i>
                        {task.deadline}
                      </div>
                      <div className="task-category">
                        <i className="fas fa-tag"></i>
                        {task.category}
                      </div>
                    </div>
                  </div>
                  <div className={`task-priority ${task.priority}`}>
                    {task.priority === "urgent" && "Khẩn cấp"}
                    {task.priority === "high" && "Cao"}
                    {task.priority === "medium" && "Trung bình"}
                    {task.priority === "low" && "Thấp"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="widget users-widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <i className="fas fa-chart-pie"></i>
              Thống kê người dùng
            </h3>
            <button className="widget-action">
              <i className="fas fa-external-link-alt"></i>
            </button>
          </div>

          <div className="widget-content">
            <div className="user-breakdown">
              {userBreakdown.map((user, index) => (
                <div key={index} className="user-stat-item">
                  <div
                    className="user-stat-icon"
                    style={{ "--user-color": user.color }}
                  >
                    <i className={user.icon}></i>
                  </div>
                  <div className="user-stat-info">
                    <h4>{user.count.toLocaleString()}</h4>
                    <p>{user.role}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="system-performance">
              <h4 className="performance-title">
                <i className="fas fa-server"></i>
                Hiệu suất hệ thống
              </h4>
              <div className="performance-metrics">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="performance-item">
                    <div className="metric-info">
                      <span className="metric-label">{metric.label}</span>
                      <span className={`metric-value ${metric.status}`}>
                        {metric.value}
                      </span>
                    </div>
                    <div className={`status-indicator ${metric.status}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
