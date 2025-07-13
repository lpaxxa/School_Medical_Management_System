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
    <div key={index} className="reports-chart-container">
      <h4>{chart.title}</h4>
      <div className="reports-chart-data">
        {chart.data.map((item, i) => (
          <div key={i} className="reports-chart-item">
            <span
              className="reports-chart-color"
              style={{ backgroundColor: item.color || "#4CAF50" }}
            ></span>
            <span className="reports-chart-label">{item.label}:</span>
            <span className="reports-chart-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="reports-generated-report">
      <div className="reports-report-header">
        <h2>{report.title}</h2>
        <p className="reports-report-meta">{report.period}</p>
      </div>

      {report.summary && (
        <div className="reports-report-content">
          <div className="reports-report-summary">
            <h3>Thống kê tổng quan</h3>
            <div className="reports-summary-grid">
              {Object.entries(report.summary).map(([key, value]) => (
                <div key={key} className="reports-summary-item">
                  <span className="reports-label">{getSummaryLabel(key)}:</span>
                  <span className="reports-number">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {report.charts && report.charts.length > 0 && (
            <div className="reports-charts">
              <h3>Biểu đồ thống kê</h3>
              {report.charts.map(renderChart)}
            </div>
          )}
        </div>
      )}

      {!report.summary && (
        <div className="reports-simple-report">
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
