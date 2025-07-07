import React, { useState, useEffect } from "react";
import {
  FaChild,
  FaCalendarCheck,
  FaUserMd,
  FaClipboardList,
  FaChartBar,
  FaSync,
} from "react-icons/fa";
import "./Dashboard.css";
import dashboardService from "./services/dashboardService";
import {
  UserRoleChart,
  HealthStatusChart,
  VaccinationProgressChart,
  HealthCheckupResponseChart,
  MedicalEventsSeverityChart,
  ConsultationTypesChart,
  BMIByGradeChart,
} from "./components/ChartComponents";

const Dashboard = () => {
  // State cho dữ liệu dashboard
  const [dashboardData, setDashboardData] = useState({
    userStats: null,
    healthCheckupReport: null,
    vaccinationReport: null,
    medicalEventsStats: null,
    consultationStats: null,
    bmiStats: null,
    vaccinationProgress: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dữ liệu thống kê cơ bản
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalMedicalEvents: 15,
    upcomingEvents: 3,
    pendingReports: 8,
  });

  // Dữ liệu sự kiện gần đây
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

  // Hàm load dữ liệu dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load tất cả dữ liệu song song
      const [
        userStats,
        healthCheckupReport,
        vaccinationReport,
        medicalEventsStats,
        consultationStats,
        bmiStats,
        vaccinationProgress,
      ] = await Promise.all([
        dashboardService.getUserStatistics(),
        dashboardService.getHealthCheckupReport(),
        dashboardService.getVaccinationReport(),
        dashboardService.getMedicalEventsStatistics(),
        dashboardService.getConsultationStatistics(),
        dashboardService.getBMIStatisticsByGrade(),
        dashboardService.getVaccinationProgress(),
      ]);

      setDashboardData({
        userStats,
        healthCheckupReport,
        vaccinationReport,
        medicalEventsStats,
        consultationStats,
        bmiStats,
        vaccinationProgress,
      });

      // Cập nhật stats cơ bản
      setStats((prev) => ({
        ...prev,
        totalStudents: healthCheckupReport.total || prev.totalStudents,
        totalMedicalEvents: medicalEventsStats.total || prev.totalMedicalEvents,
        pendingReports: consultationStats.stats.unread || prev.pendingReports,
      }));
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard. Sử dụng dữ liệu mẫu.");
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Hàm refresh dữ liệu
  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <div className="dashboard-content">
      {/* Header với nút refresh */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Tổng quan Y tế học đường</h1>
            <p>Xin chào! Đây là tổng quan hoạt động y tế của trường.</p>
          </div>
          <button
            className={`refresh-btn ${loading ? "loading" : ""}`}
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSync className={loading ? "spin" : ""} />
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
        </div>
      )}

      {/* Thống kê tổng quan */}
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

      {/* Section biểu đồ */}
      <div className="charts-section">
        <div className="section-header">
          <h2>
            <FaChartBar /> Thống kê và Biểu đồ
          </h2>
        </div>

        {/* Hàng 1: User Role Chart & Health Status Chart */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Phân bổ người dùng hệ thống</h3>
              {dashboardData.userStats && (
                <span className="chart-subtitle">
                  Tổng: {dashboardData.userStats.total} người dùng
                </span>
              )}
            </div>
            <div className="chart-content">
              {loading ? (
                <div className="chart-loading">Đang tải...</div>
              ) : dashboardData.userStats ? (
                <UserRoleChart data={dashboardData.userStats} />
              ) : (
                <div className="chart-error">Không có dữ liệu</div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Phân loại sức khỏe học sinh</h3>
              <span className="chart-subtitle">
                Dựa trên kết quả khám gần nhất
              </span>
            </div>
            <div className="chart-content">
              <HealthStatusChart />
            </div>
          </div>
        </div>

        {/* Hàng 2: Vaccination Progress & Health Checkup Response */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Tiến độ tiêm chủng 6 tháng qua</h3>
              <span className="chart-subtitle">Số lượng học sinh đã tiêm</span>
            </div>
            <div className="chart-content">
              {loading ? (
                <div className="chart-loading">Đang tải...</div>
              ) : dashboardData.vaccinationProgress ? (
                <VaccinationProgressChart
                  data={dashboardData.vaccinationProgress}
                />
              ) : (
                <div className="chart-error">Không có dữ liệu</div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Tỷ lệ phản hồi khám sức khỏe</h3>
              {dashboardData.healthCheckupReport && (
                <span className="chart-subtitle">
                  Tổng: {dashboardData.healthCheckupReport.total} thông báo
                </span>
              )}
            </div>
            <div className="chart-content">
              {loading ? (
                <div className="chart-loading">Đang tải...</div>
              ) : dashboardData.healthCheckupReport ? (
                <HealthCheckupResponseChart
                  data={dashboardData.healthCheckupReport}
                />
              ) : (
                <div className="chart-error">Không có dữ liệu</div>
              )}
            </div>
          </div>
        </div>

        {/* Hàng 3: Medical Events & Consultation Types */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Sự cố y tế theo mức độ nghiêm trọng</h3>
              {dashboardData.medicalEventsStats && (
                <span className="chart-subtitle">
                  Tổng: {dashboardData.medicalEventsStats.total} sự cố
                </span>
              )}
            </div>
            <div className="chart-content">
              {loading ? (
                <div className="chart-loading">Đang tải...</div>
              ) : dashboardData.medicalEventsStats ? (
                <MedicalEventsSeverityChart
                  data={dashboardData.medicalEventsStats}
                />
              ) : (
                <div className="chart-error">Không có dữ liệu</div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Các loại tư vấn y tế</h3>
              {dashboardData.consultationStats && (
                <span className="chart-subtitle">
                  Tổng: {dashboardData.consultationStats.total} tư vấn
                </span>
              )}
            </div>
            <div className="chart-content">
              {loading ? (
                <div className="chart-loading">Đang tải...</div>
              ) : dashboardData.consultationStats ? (
                <ConsultationTypesChart
                  data={dashboardData.consultationStats}
                />
              ) : (
                <div className="chart-error">Không có dữ liệu</div>
              )}
            </div>
          </div>
        </div>

        {/* Hàng 4: BMI Chart (full width) */}
        <div className="charts-row">
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>Phân bố BMI theo khối lớp</h3>
              <span className="chart-subtitle">
                Thống kê chỉ số BMI học sinh từng khối
              </span>
            </div>
            <div className="chart-content large">
              {loading ? (
                <div className="chart-loading">Đang tải...</div>
              ) : dashboardData.bmiStats ? (
                <BMIByGradeChart data={dashboardData.bmiStats} />
              ) : (
                <div className="chart-error">Không có dữ liệu</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phần sự kiện và cảnh báo */}
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
                <div key={alert.id} className={`alert-item ${alert.severity}`}>
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
};

export default Dashboard;
