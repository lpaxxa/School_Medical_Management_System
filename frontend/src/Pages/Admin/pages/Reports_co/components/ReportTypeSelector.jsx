import React from "react";
import "./ReportTypeSelector.css";

const ReportTypeSelector = ({ reportType, setReportType }) => {
  const reportTypes = [
    {
      id: "health",
      icon: "fas fa-user-graduate",
      title: "Quản lý học sinh", // Đã thay đổi từ "Báo cáo sức khỏe"
      desc: "Thống kê sức khỏe học sinh",
      colorTheme: "teal",
    },
    {
      id: "vaccination",
      icon: "fas fa-syringe",
      title: "Báo cáo tiêm chủng",
      desc: "Kết quả chiến dịch tiêm chủng",
      colorTheme: "orange",
    },
    {
      id: "vaccine",
      icon: "fas fa-syringe",
      title: "Báo cáo vaccine",
      desc: "Danh sách và thông tin vaccine",
      colorTheme: "blue",
    },
    {
      id: "medication",
      icon: "fas fa-pills",
      title: "Báo cáo thuốc",
      desc: "Thống kê sử dụng thuốc",
      colorTheme: "green",
    },
    {
      id: "checkup",
      icon: "fas fa-heartbeat",
      title: "Báo cáo khám sức khỏe định kỳ",
      desc: "Thống kê khám sức khỏe định kỳ",
      colorTheme: "purple",
    },
  ];

  return (
    <div className="reports-type-selector">
      <div className="reports-type-options">
        {reportTypes.map((type) => (
          <div
            key={type.id}
            className={`reports-type-option ${
              reportType === type.id ? "selected" : ""
            } reports-type-option-${type.colorTheme}`}
            data-type={type.id}
            data-theme={type.colorTheme}
            onClick={() => setReportType(type.id)}
          >
            <input
              type="radio"
              name="reportType"
              value={type.id}
              checked={reportType === type.id}
              onChange={() => setReportType(type.id)}
            />
            <div className="reports-type-content">
              <h3 className="reports-type-title">
                <i className={type.icon}></i>
                {type.title}
              </h3>
              <p className="reports-type-description">{type.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTypeSelector;
