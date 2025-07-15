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
  VaccinationPlansStatusChart,
  HealthCheckupResponseChart,
  MedicalEventsSeverityChart,
  ConsultationTypesChart,
  BMIByGradeChart,
  HealthCampaignStatusChart,
  StudentsByGradeChart,
  MedicationApprovalStatusChart,
  MedicationConsumptionStatusChart,
  VaccinationTypeChart,
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
    healthCampaignStats: null,
    recentEvents: null,
    recentVaccinationPlans: null,
    studentsGradeData: null,
    medicationStats: null,
    vaccinationTypeStats: null,
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

  // Get recentEvents from dashboardData or use fallback
  const recentEvents = dashboardData.recentEvents || [
    {
      id: 1,
      title: "Kiểm tra sức khỏe định kỳ K1-K5",
      date: "20/06/2025",
      type: "health-campaign",
      status: "ongoing",
    },
    {
      id: 2,
      title: "Chiến dịch tiêm chủng mùa hè",
      date: "15/06/2025",
      type: "health-campaign",
      status: "completed",
    },
    {
      id: 3,
      title: "Khám sàng lọc răng miệng",
      date: "10/06/2025",
      type: "health-campaign",
      status: "upcoming",
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
        healthCampaignStats,
        recentEvents,
        recentVaccinationPlans,
        studentsGradeData,
        medicationStats,
        vaccinationTypeStats,
      ] = await Promise.all([
        dashboardService.getUserStatistics(),
        dashboardService.getHealthCheckupReport(),
        dashboardService.getVaccinationReport(),
        dashboardService.getMedicalEventsStatistics(),
        dashboardService.getConsultationStatistics(),
        dashboardService.getBMIStatisticsByGrade(),
        dashboardService.getHealthCampaignStatistics(),
        dashboardService.getRecentHealthCampaigns(5), // Limit to 5 recent campaigns
        dashboardService.getRecentVaccinationPlans(5), // Limit to 5 recent vaccination plans
        dashboardService.getStudentsByGradeLevel(),
        dashboardService.getMedicationInstructionStatistics(),
        dashboardService.getVaccinationTypeStatistics(),
      ]);

      setDashboardData({
        userStats,
        healthCheckupReport,
        vaccinationReport,
        medicalEventsStats,
        consultationStats,
        bmiStats,
        healthCampaignStats,
        recentEvents,
        recentVaccinationPlans,
        studentsGradeData,
        medicationStats,
        vaccinationTypeStats,
      });

      // Cập nhật stats cơ bản
      setStats((prev) => ({
        ...prev,
        totalStudents: healthCheckupReport.total || prev.totalStudents,
        totalMedicalEvents: medicalEventsStats.total || prev.totalMedicalEvents,
        upcomingEvents: vaccinationReport.pending || prev.upcomingEvents,
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
    <div className="admin_ui_dash_content">
      {/* Header với nút refresh */}
      <div className="admin_ui_dash_header">
        <div className="admin_ui_dash_header_content">
          <div>
            <h1>Tổng quan Y tế học đường</h1>
          </div>
        </div>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="admin_ui_dash_error_banner">
          <span>{error}</span>
        </div>
      )}

      {/* Hiển thị thông báo fallback data */}
      {!loading &&
        (dashboardData.userStats?.usingFallback ||
          dashboardData.studentsGradeData?.usingFallback ||
          dashboardData.medicationStats?.usingFallback ||
          dashboardData.vaccinationTypeStats?.usingFallback ||
          dashboardData.healthCampaignStats?.usingFallback ||
          dashboardData.medicalEventsStats?.usingFallback ||
          dashboardData.bmiStats?._metadata?.usingFallback) && (
          <div className="admin_ui_dash_info_banner">
            <span>
              📊 Đang hiển thị dữ liệu mẫu do cơ sở dữ liệu chưa có dữ liệu thực
              tế. Dữ liệu sẽ tự động cập nhật khi có thông tin mới.
            </span>
          </div>
        )}

      {/* Thống kê tổng quan */}
      {/* <div className="admin_ui_dash_stats-container">
        <div className="admin_ui_dash_stat-card">
          <div className="admin_ui_dash_stat-icon students">
            <FaChild />
          </div>
          <div className="admin_ui_dash_stat-details">
            <h3>Tổng số học sinh</h3>
            <p className="admin_ui_dash_stat-value">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="admin_ui_dash_stat-card">
          <div className="admin_ui_dash_stat-icon events">
            <FaCalendarCheck />
          </div>
          <div className="admin_ui_dash_stat-details">
            <h3>Sự kiện y tế năm nay</h3>
            <p className="admin_ui_dash_stat-value">{stats.totalMedicalEvents}</p>
          </div>
        </div>

        <div className="admin_ui_dash_stat-card">
          <div className="admin_ui_dash_stat-icon upcoming">
            <FaUserMd />
          </div>
          <div className="admin_ui_dash_stat-details">
            <h3>Kế hoạch tiêm chủng đang chờ</h3>
            <p className="admin_ui_dash_stat-value">{stats.upcomingEvents}</p>
          </div>
        </div>

        <div className="admin_ui_dash_stat-card">
          <div className="admin_ui_dash_stat-icon reports">
            <FaClipboardList />
          </div>
          <div className="admin_ui_dash_stat-details">
            <h3>Báo cáo chờ xử lý</h3>
            <p className="admin_ui_dash_stat-value">{stats.pendingReports}</p>
          </div>
        </div>
      </div> */}
      <div className="admin_ui_dash_stats-container">
        {/* Phần sự kiện và cảnh báo */}
        <div className="admin_ui_dash_content-grid">
          {/* Recent Medical Events */}
          <div className="admin_ui_dash_card events-list">
            <div className="admin_ui_dash_card-header">
              <h2>Sự kiện y tế gần đây</h2>
              {/* <button className="admin_ui_dash_view-all-btn">Xem tất cả</button> */}
            </div>
            <div className="admin_ui_dash_card-content">
              <table className="admin_ui_dash_events-table">
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
                        <span
                          className={`admin_ui_dash_event-status-tag ${event.status}`}
                        >
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
        </div>
        {/* Recent Vaccination Plans */}
        <div className="admin_ui_dash_card events-list">
          <div className="admin_ui_dash_card-header">
            <h2>Kế hoạch tiêm chủng gần đây</h2>
            {/* <button className="admin_ui_dash_view-all-btn">Xem tất cả</button> */}
          </div>
          <div className="admin_ui_dash_card-content">
            <table className="admin_ui_dash_events-table">
              <thead>
                <tr>
                  <th>Tên kế hoạch</th>
                  <th>Ngày tiêm</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {(dashboardData.recentVaccinationPlans || []).map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.name}</td>
                    <td>{plan.date}</td>
                    <td>
                      <span
                        className={`admin_ui_dash_event-status-tag ${plan.status}`}
                      >
                        {plan.status === "completed"
                          ? "Hoàn thành"
                          : plan.status === "upcoming"
                          ? "Sắp diễn ra"
                          : plan.status === "in-progress"
                          ? "Đang tiến hành"
                          : plan.status === "cancelled"
                          ? "Đã hủy"
                          : "Chờ xử lý"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section biểu đồ */}
      <div className="admin_ui_dash_charts-section">
        {/* <div className="admin_ui_dash_section-header">
          <h2>
            <FaChartBar /> Thống kê và Biểu đồ
          </h2>
        </div> */}

        {/* Hàng 1: User Role Chart & Students by Grade Chart */}
        <div className="admin_ui_dash_charts-row">
          <div className="admin_ui_dash_chart-card">
            <div className="admin_ui_dash_chart-header">
              <h3>Phân bổ người dùng hệ thống</h3>
              {dashboardData.userStats && (
                <span className="admin_ui_dash_chart-subtitle">
                  Tổng: {dashboardData.userStats.total} người dùng
                </span>
              )}
            </div>
            <div className="admin_ui_dash_chart-content">
              {loading ? (
                <div className="admin_ui_dash_chart-loading">Đang tải...</div>
              ) : dashboardData.userStats ? (
                <UserRoleChart data={dashboardData.userStats} />
              ) : (
                <div className="admin_ui_dash_chart-error">Không có dữ liệu</div>
              )}
            </div>
          </div>

          <div className="admin_ui_dash_chart-card">
            <div className="admin_ui_dash_chart-header">
              <h3>Số lượng học sinh theo khối lớp</h3>
              {dashboardData.studentsGradeData && (
                <span className="admin_ui_dash_chart-subtitle">
                  Tổng: {dashboardData.studentsGradeData.total} học sinh
                </span>
              )}
            </div>
            <div className="admin_ui_dash_chart-content">
              {loading ? (
                <div className="admin_ui_dash_chart-loading">Đang tải...</div>
              ) : dashboardData.studentsGradeData ? (
                <StudentsByGradeChart data={dashboardData.studentsGradeData} />
              ) : (
                <div className="admin_ui_dash_chart-error">
                  <p>Không có dữ liệu học sinh theo khối lớp</p>
                  <button
                    onClick={() => window.dashboardService?.testStudentsAPI?.()}
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      marginTop: "8px",
                    }}
                  >
                    Test API
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hàng 2: Health Status Chart & Health Campaign Status Chart */}
        <div className="admin_ui_dash_charts-row">
          {/* <div className="admin_ui_dash_chart-card">
            <div className="admin_ui_dash_chart-header">
              <h3>Phân loại sức khỏe học sinh</h3>
              <span className="admin_ui_dash_chart-subtitle">
                Dựa trên kết quả khám gần nhất
              </span>
            </div>
            <div className="admin_ui_dash_chart-content">
              <HealthStatusChart />
            </div>
          </div> */}

          <div className="admin_ui_dash_chart-card">
            <div className="admin_ui_dash_chart-header">
              <h3>Trạng thái chiến dịch sức khỏe</h3>
              {dashboardData.healthCampaignStats && (
                <span className="admin_ui_dash_chart-subtitle">
                  Tổng: {dashboardData.healthCampaignStats.total} chiến dịch
                </span>
              )}
            </div>
            <div className="admin_ui_dash_chart-content">
              {loading ? (
                <div className="admin_ui_dash_chart-loading">Đang tải...</div>
              ) : dashboardData.healthCampaignStats ? (
                <HealthCampaignStatusChart
                  data={dashboardData.healthCampaignStats}
                />
              ) : (
                <div className="admin_ui_dash_chart-error">
                  <p>Không có dữ liệu chiến dịch sức khỏe</p>
                  <button
                    onClick={() =>
                      window.dashboardService?.testHealthCampaignsAPI?.()
                    }
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      marginTop: "8px",
                    }}
                  >
                    Test API
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hàng 3: Vaccination Progress & Health Checkup Response
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Thống kê kế hoạch tiêm chủng</h3>
              {dashboardData.vaccinationReport && (
                <span className="chart-subtitle">
                  Tổng: {dashboardData.vaccinationReport.total} kế hoạch
                </span>
              )}
            </div>
            <div className="chart-content">
              {loading ? (
                <div className="chart-loading">Đang tải...</div>
              ) : dashboardData.vaccinationReport ? (
                <VaccinationPlansStatusChart
                  data={dashboardData.vaccinationReport}
                />
              ) : (
                <div className="chart-error">
                  <p>Không có dữ liệu kế hoạch tiêm chủng</p>
                  <button 
                    onClick={() => window.dashboardService?.testVaccinationPlansAPI?.()}
                    style={{fontSize: '12px', padding: '4px 8px', marginTop: '8px'}}
                  >
                    Test API
                  </button>
                </div>
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
        </div> */}

        {/* Hàng 4: Medical Events Severity & Vaccination Type Chart */}
        <div className="admin_ui_dash_charts-row">
          <div className="admin_ui_dash_chart-card">
            <div className="admin_ui_dash_chart-header">
              <h3>Sự cố y tế theo mức độ nghiêm trọng</h3>
              {dashboardData.medicalEventsStats && (
                <span className="admin_ui_dash_chart-subtitle">
                  Tổng: {dashboardData.medicalEventsStats.total} sự cố
                </span>
              )}
            </div>
            <div className="admin_ui_dash_chart-content">
              {loading ? (
                <div className="admin_ui_dash_chart-loading">Đang tải...</div>
              ) : dashboardData.medicalEventsStats ? (
                <MedicalEventsSeverityChart
                  data={dashboardData.medicalEventsStats}
                />
              ) : (
                <div className="admin_ui_dash_chart-error">
                  <p>Không có dữ liệu sự cố y tế</p>
                  <button
                    onClick={() =>
                      window.dashboardService?.testMedicalIncidentsAPI?.()
                    }
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      marginTop: "8px",
                    }}
                  >
                    Test API
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="admin_ui_dash_chart-card">
            <div className="admin_ui_dash_chart-header">
              <h3>Phân loại tiêm chủng theo nguồn</h3>
              {dashboardData.vaccinationTypeStats && (
                <span className="admin_ui_dash_chart-subtitle">
                  Tổng: {dashboardData.vaccinationTypeStats.total} mũi tiêm
                </span>
              )}
            </div>
            <div className="admin_ui_dash_chart-content">
              {loading ? (
                <div className="admin_ui_dash_chart-loading">Đang tải...</div>
              ) : dashboardData.vaccinationTypeStats ? (
                <VaccinationTypeChart
                  data={dashboardData.vaccinationTypeStats}
                />
              ) : (
                <div className="admin_ui_dash_chart-error">
                  <p>Không có dữ liệu phân loại tiêm chủng</p>
                  <button
                    onClick={() =>
                      window.dashboardService?.testVaccinationsAPI?.()
                    }
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      marginTop: "8px",
                    }}
                  >
                    Test API
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hàng 5: Medication Status Charts */}
        <div className="admin_ui_dash_charts-row">
          <div className="admin_ui_dash_chart-card">
            <div className="admin_ui_dash_chart-header">
              <h3>Trạng thái phê duyệt thuốc</h3>
              {dashboardData.medicationStats && (
                <span className="admin_ui_dash_chart-subtitle">
                  Tổng: {dashboardData.medicationStats.approvalStats.total} yêu
                  cầu
                </span>
              )}
            </div>
            <div className="admin_ui_dash_chart-content">
              {loading ? (
                <div className="admin_ui_dash_chart-loading">Đang tải...</div>
              ) : dashboardData.medicationStats ? (
                <MedicationApprovalStatusChart
                  data={dashboardData.medicationStats.approvalStats}
                />
              ) : (
                <div className="admin_ui_dash_chart-error">
                  <p>Không có dữ liệu phê duyệt thuốc</p>
                  <button
                    onClick={() =>
                      window.dashboardService?.testMedicationInstructionsAPI?.()
                    }
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      marginTop: "8px",
                    }}
                  >
                    Test API
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="admin_ui_dash_chart-card">
            <div className="admin_ui_dash_chart-header">
              <h3>Trạng thái sử dụng thuốc</h3>
              {dashboardData.medicationStats && (
                <span className="admin_ui_dash_chart-subtitle">
                  Tổng: {dashboardData.medicationStats.consumptionStats.total}{" "}
                  thuốc
                </span>
              )}
            </div>
            <div className="admin_ui_dash_chart-content">
              {loading ? (
                <div className="admin_ui_dash_chart-loading">Đang tải...</div>
              ) : dashboardData.medicationStats?.consumptionStats?.total > 0 ? (
                <MedicationConsumptionStatusChart
                  data={dashboardData.medicationStats.consumptionStats}
                />
              ) : (
                <div className="admin_ui_dash_chart-error">
                  <p>Không có dữ liệu sử dụng thuốc</p>
                  <span style={{ fontSize: "10px", color: "#666" }}>
                    (Chỉ hiển thị khi có thuốc đã được sử dụng)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hàng 6: BMI Chart (full width) */}
        <div className="admin_ui_dash_charts-row">
          <div className="admin_ui_dash_chart-card full-width">
            <div className="admin_ui_dash_chart-header">
              <h3>Phân bố BMI theo khối lớp</h3>
              {dashboardData.bmiStats?._metadata ? (
                <span className="admin_ui_dash_chart-subtitle">
                  {/* {dashboardData.bmiStats._metadata.totalWithBMI} học sinh có dữ liệu BMI / {dashboardData.bmiStats._metadata.totalCheckups} lần khám */}
                </span>
              ) : (
                <span className="admin_ui_dash_chart-subtitle">
                  Thống kê chỉ số BMI từ kết quả khám sức khỏe định kỳ
                </span>
              )}
            </div>
            <div className="admin_ui_dash_chart-content large">
              {loading ? (
                <div className="admin_ui_dash_chart-loading">Đang tải...</div>
              ) : dashboardData.bmiStats ? (
                <BMIByGradeChart data={dashboardData.bmiStats} />
              ) : (
                <div className="admin_ui_dash_chart-error">
                  <p>Không có dữ liệu BMI theo khối lớp</p>
                  <button
                    onClick={() =>
                      window.dashboardService?.testMedicalCheckupsAPI?.()
                    }
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      marginTop: "8px",
                    }}
                  >
                    Test API
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
