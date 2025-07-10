import React from "react";
import "./ReportTypeSelector.css";

const ReportTypeSelector = ({ reportType, setReportType }) => {
  const reportTypes = [
    {
      id: "health",
      icon: "fas fa-heartbeat",
      title: "Quản lý học sinh", // Đã thay đổi từ "Báo cáo sức khỏe"
      desc: "Thống kê sức khỏe học sinh",
    },
    {
      id: "vaccination",
      icon: "fas fa-syringe",
      title: "Báo cáo tiêm chủng",
      desc: "Kết quả chiến dịch tiêm chủng",
    },
    {
      id: "vaccine",
      icon: "fas fa-shield-virus",
      title: "Báo cáo vaccine",
      desc: "Danh sách và thông tin vaccine",
    },
    {
      id: "medication",
      icon: "fas fa-pills",
      title: "Báo cáo thuốc",
      desc: "Thống kê sử dụng thuốc",
    },
    {
      id: "checkup",
      icon: "fas fa-user-md",
      title: "Báo cáo khám sức khỏe định kỳ",
      desc: "Thống kê khám sức khỏe định kỳ",
    },
  ];

  return (
    <div className="report-type-section">
      <div className="report-types">
        {reportTypes.map((type) => (
          <div
            key={type.id}
            className={`report-type-item ${
              reportType === type.id ? "selected" : ""
            }`}
            data-type={type.id}
            onClick={() => setReportType(type.id)}
          >
            <i className={`report-type-icon ${type.icon}`}></i>
            <div className="report-type-content">
              <h3 className="report-type-title">{type.title}</h3>
              <p className="report-type-desc">{type.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTypeSelector;
