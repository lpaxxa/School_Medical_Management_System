import React, { useState, useEffect } from "react";
import "./Reports.css";

const Reports = () => {
  const [reportType, setReportType] = useState("users");
  const [dateRange, setDateRange] = useState("month");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Clear generated report when report type changes
    setGeneratedReport(null);
  }, [reportType, dateRange]);

  const reportTypes = [
    { id: "users", label: "Người dùng", icon: "fas fa-users" },
    { id: "activities", label: "Hoạt động", icon: "fas fa-chart-line" },
    { id: "health", label: "Sức khỏe", icon: "fas fa-heartbeat" },
    { id: "incidents", label: "Sự cố", icon: "fas fa-exclamation-triangle" },
    { id: "medications", label: "Thuốc", icon: "fas fa-pills" },
  ];

  const dateRanges = [
    { id: "week", label: "Tuần này" },
    { id: "month", label: "Tháng này" },
    { id: "quarter", label: "Quý này" },
    { id: "year", label: "Năm nay" },
    { id: "custom", label: "Tùy chỉnh" },
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);

    // Simulate API call to generate report
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedReport(getMockReportData());
    }, 1500);
  };

  const handleExportReport = (format) => {
    if (!generatedReport) return;

    setIsExporting(true);

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);

      // In a real app, this would trigger a file download
      console.log(`Exporting as ${format}...`);
      alert(`Xuất báo cáo định dạng ${format.toUpperCase()} thành công!`);
    }, 1000);
  };

  const getMockReportData = () => {
    switch (reportType) {
      case "users":
        return {
          title: "Báo cáo thống kê người dùng",
          period: getPeriodLabel(),
          summary: {
            total: 1850,
            active: 1720,
            inactive: 95,
            pending: 35,
            newUsers: 45,
          },
          charts: [
            {
              type: "pie",
              title: "Phân bố vai trò",
              data: [
                { label: "Phụ huynh", value: 847, color: "#3498db" },
                { label: "Học sinh", value: 985, color: "#2ecc71" },
                { label: "Y tá", value: 15, color: "#e74c3c" },
                { label: "Quản trị viên", value: 3, color: "#f39c12" },
              ],
            },
            {
              type: "line",
              title: "Người dùng mới theo thời gian",
              data: [
                { date: "01/06", value: 5 },
                { date: "02/06", value: 8 },
                { date: "03/06", value: 12 },
                { date: "04/06", value: 7 },
                { date: "05/06", value: 10 },
              ],
            },
          ],
          table: {
            headers: [
              "Vai trò",
              "Tổng số",
              "Hoạt động",
              "Không hoạt động",
              "Chờ duyệt",
            ],
            rows: [
              ["Phụ huynh", 847, 802, 30, 15],
              ["Học sinh", 985, 905, 60, 20],
              ["Y tá", 15, 12, 3, 0],
              ["Quản trị viên", 3, 3, 0, 0],
            ],
          },
        };
      case "activities":
        return {
          title: "Báo cáo hoạt động hệ thống",
          period: getPeriodLabel(),
          summary: {
            totalLogins: 3250,
            totalActions: 8720,
            averageSessionTime: "12m 30s",
            peakHour: "10:00 - 11:00",
          },
          charts: [
            {
              type: "bar",
              title: "Hoạt động theo ngày",
              data: [
                { date: "01/06", value: 310 },
                { date: "02/06", value: 285 },
                { date: "03/06", value: 340 },
                { date: "04/06", value: 275 },
                { date: "05/06", value: 320 },
              ],
            },
          ],
          table: {
            headers: ["Loại hoạt động", "Số lượng", "% Tổng"],
            rows: [
              ["Đăng nhập", 3250, "37%"],
              ["Xem hồ sơ", 2150, "25%"],
              ["Cập nhật thông tin", 1840, "21%"],
              ["Tạo báo cáo", 980, "11%"],
              ["Khác", 500, "6%"],
            ],
          },
        };
      case "health":
        return {
          title: "Báo cáo sức khỏe học sinh",
          period: getPeriodLabel(),
          summary: {
            totalRecords: 985,
            incidentReports: 45,
            healthIssues: 78,
            vaccineUpdates: 120,
          },
          charts: [
            {
              type: "pie",
              title: "Các vấn đề sức khỏe phổ biến",
              data: [
                { label: "Cảm cúm", value: 35, color: "#3498db" },
                { label: "Dị ứng", value: 18, color: "#2ecc71" },
                { label: "Chấn thương nhẹ", value: 15, color: "#e74c3c" },
                { label: "Khác", value: 10, color: "#f39c12" },
              ],
            },
          ],
          table: {
            headers: ["Lớp", "Số học sinh", "Báo cáo sự cố", "Thuốc đăng ký"],
            rows: [
              ["Lớp 1", 125, 8, 15],
              ["Lớp 2", 130, 10, 18],
              ["Lớp 3", 128, 7, 12],
              ["Lớp 4", 135, 12, 20],
              ["Lớp 5", 120, 5, 14],
            ],
          },
        };
      default:
        return {
          title: `Báo cáo ${reportType}`,
          period: getPeriodLabel(),
          summary: {
            total: 1850,
          },
          charts: [],
          table: {
            headers: ["Column 1", "Column 2"],
            rows: [
              ["Data 1", "Data 2"],
              ["Data 3", "Data 4"],
            ],
          },
        };
    }
  };

  const getPeriodLabel = () => {
    const now = new Date();
    switch (dateRange) {
      case "week":
        return `Tuần ${getWeekNumber(now)}, ${now.getFullYear()}`;
      case "month":
        return `Tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;
      case "quarter":
        return `Quý ${
          Math.floor(now.getMonth() / 3) + 1
        }, ${now.getFullYear()}`;
      case "year":
        return `Năm ${now.getFullYear()}`;
      case "custom":
        return "Khoảng thời gian tùy chỉnh";
      default:
        return "Khoảng thời gian không xác định";
    }
  };

  const getWeekNumber = (date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date - firstDay) / 86400000 + firstDay.getDay() + 1) / 7
    );
  };

  // Render the Bar Chart
  const renderBarChart = (chartData) => {
    if (!chartData || !chartData.data || chartData.data.length === 0)
      return null;

    const maxValue = Math.max(...chartData.data.map((d) => d.value));

    return (
      <div className="chart-container bar-chart">
        <h4 className="chart-title">{chartData.title}</h4>
        <div className="bar-chart-content">
          {chartData.data.map((item, index) => (
            <div className="bar-item" key={index}>
              <div className="bar-label">{item.date}</div>
              <div className="bar-column">
                <div
                  className="bar-fill"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                >
                  <span className="bar-value">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the Pie Chart
  const renderPieChart = (chartData) => {
    if (!chartData || !chartData.data || chartData.data.length === 0)
      return null;

    return (
      <div className="chart-container pie-chart">
        <h4 className="chart-title">{chartData.title}</h4>
        <div className="pie-chart-content">
          <div className="pie-visualization">
            {/* In a real app, you'd use a library like Chart.js or D3 */}
            <div className="pie-placeholder">
              <i className="fas fa-chart-pie"></i>
            </div>
          </div>
          <div className="pie-legend">
            {chartData.data.map((item, index) => (
              <div className="legend-item" key={index}>
                <div
                  className="color-box"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="legend-label">{item.label}</div>
                <div className="legend-value">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="header-title">
          <h1>
            <i className="fas fa-chart-bar"></i>
            Báo cáo & Thống kê
          </h1>
          <p>Tạo và xuất các báo cáo thống kê tổng hợp</p>
        </div>
      </div>

      {/* Report Generator Form */}
      <div className="report-generator">
        <h2 className="section-title">Tạo báo cáo mới</h2>

        <div className="generator-form">
          <div className="form-section">
            <h3>
              <i className="fas fa-file-alt"></i>
              Loại báo cáo
            </h3>
            <div className="report-types">
              {reportTypes.map((type) => (
                <div
                  key={type.id}
                  className={`report-type-item ${
                    reportType === type.id ? "active" : ""
                  }`}
                  onClick={() => setReportType(type.id)}
                >
                  <div className="type-icon">
                    <i className={type.icon}></i>
                  </div>
                  <span>{type.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>
              <i className="fas fa-calendar-alt"></i>
              Khoảng thời gian
            </h3>
            <div className="date-ranges">
              {dateRanges.map((range) => (
                <button
                  key={range.id}
                  className={`date-range-btn ${
                    dateRange === range.id ? "active" : ""
                  }`}
                  onClick={() => setDateRange(range.id)}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {dateRange === "custom" && (
              <div className="custom-date-range">
                <div className="date-picker">
                  <label>Từ ngày:</label>
                  <input type="date" />
                </div>
                <div className="date-picker">
                  <label>Đến ngày:</label>
                  <input type="date" />
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary generate-btn"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang tạo báo cáo...
                </>
              ) : (
                <>
                  <i className="fas fa-file-medical"></i>
                  Tạo báo cáo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Display */}
      {generatedReport && (
        <div className="generated-report">
          <div className="report-header">
            <h2>{generatedReport.title}</h2>
            <p className="report-period">{generatedReport.period}</p>

            <div className="report-actions">
              <div className="dropdown">
                <button className="btn btn-export">
                  <i className="fas fa-file-export"></i>
                  Xuất báo cáo
                  <i className="fas fa-chevron-down"></i>
                </button>
                <div className="dropdown-content">
                  <button
                    onClick={() => handleExportReport("pdf")}
                    disabled={isExporting}
                  >
                    <i className="fas fa-file-pdf"></i> PDF
                  </button>
                  <button
                    onClick={() => handleExportReport("excel")}
                    disabled={isExporting}
                  >
                    <i className="fas fa-file-excel"></i> Excel
                  </button>
                  <button
                    onClick={() => handleExportReport("csv")}
                    disabled={isExporting}
                  >
                    <i className="fas fa-file-csv"></i> CSV
                  </button>
                </div>
              </div>

              <button className="btn btn-secondary">
                <i className="fas fa-print"></i>
                In báo cáo
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="report-summary">
            {Object.entries(generatedReport.summary).map(
              ([key, value], index) => (
                <div className="summary-card" key={index}>
                  <h4>{getSummaryLabel(key)}</h4>
                  <div className="summary-value">{value}</div>
                </div>
              )
            )}
          </div>

          {/* Charts Section */}
          <div className="report-charts">
            {generatedReport.charts.map((chart, index) => {
              if (chart.type === "bar") {
                return renderBarChart(chart);
              } else if (chart.type === "pie") {
                return renderPieChart(chart);
              } else if (chart.type === "line") {
                // In a real app, implement line chart rendering
                return (
                  <div className="chart-container line-chart" key={index}>
                    <h4 className="chart-title">{chart.title}</h4>
                    <div className="line-chart-placeholder">
                      <i className="fas fa-chart-line"></i>
                      <span>Biểu đồ đường</span>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Data Table */}
          {generatedReport.table && (
            <div className="report-table-container">
              <h3>Dữ liệu chi tiết</h3>
              <div className="report-table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      {generatedReport.table.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReport.table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get human-readable summary labels
const getSummaryLabel = (key) => {
  const labels = {
    total: "Tổng số",
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    pending: "Chờ duyệt",
    newUsers: "Người dùng mới",
    totalLogins: "Lượt đăng nhập",
    totalActions: "Tổng số thao tác",
    averageSessionTime: "Thời gian phiên TB",
    peakHour: "Giờ cao điểm",
    totalRecords: "Số hồ sơ",
    incidentReports: "Báo cáo sự cố",
    healthIssues: "Vấn đề sức khỏe",
    vaccineUpdates: "Cập nhật vaccine",
  };

  return labels[key] || key;
};

export default Reports;
