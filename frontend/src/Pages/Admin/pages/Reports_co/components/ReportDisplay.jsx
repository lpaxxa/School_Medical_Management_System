import React from "react";
import "./ReportDisplay.css";


const ReportDisplay = ({ report }) => {
  if (!report) return null;

  const getSummaryLabel = (key) => {
    const labels = {
      totalNotifications: "Tổng số thông báo",
      totalRecipients: "Tổng số người nhận",
      acceptedCount: "Đã chấp nhận",
      pendingCount: "Chờ phản hồi",
      rejectedCount: "Từ chối",
      completionRate: "Tỷ lệ hoàn thành",
      participationRate: "Tỷ lệ tham gia",
      totalExaminations: "Tổng số lần khám",
      abnormalFindings: "Phát hiện bất thường",
      referralsIssued: "Chuyển viện",
      totalMedications: "Tổng số loại thuốc",
      mostUsed: "Thuốc sử dụng nhiều nhất",
      inventoryValue: "Giá trị tồn kho",
    };
    return labels[key] || key;
  };

  const renderChart = (chart, index) => (
    <div key={index} className="chart-container">
      <h4>{chart.title}</h4>
      <div className="chart-data">
        {chart.data.map((item, i) => (
          <div key={i} className="chart-item">
            <span
              className="chart-color"
              style={{ backgroundColor: item.color || "#4CAF50" }}
            ></span>
            <span className="chart-label">{item.label}:</span>
            <span className="chart-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="generated-report">
      <div className="report-header">
        <h2>{report.title}</h2>
        <p className="report-period">{report.period}</p>
      </div>

      {report.summary && (
        <div className="report-content">
          <div className="report-summary">
            <h3>Thống kê tổng quan</h3>
            <div className="summary-grid">
              {Object.entries(report.summary).map(([key, value]) => (
                <div key={key} className="summary-item">
                  <span className="summary-label">{getSummaryLabel(key)}:</span>
                  <span className="summary-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {report.charts && report.charts.length > 0 && (
            <div className="report-charts">
              <h3>Biểu đồ thống kê</h3>
              {report.charts.map(renderChart)}
            </div>
          )}
        </div>
      )}

      {!report.summary && (
        <div className="simple-report">
          <p>
            Báo cáo đã được tạo thành công. Chi tiết báo cáo sẽ hiển thị tại
            đây.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportDisplay;
