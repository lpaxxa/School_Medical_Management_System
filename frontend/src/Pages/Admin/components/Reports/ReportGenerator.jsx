import React, { useState } from "react";
import ReportExport from "./ReportExport";
import "./Reports.css";

const reportTypes = [
  {
    id: "health_status",
    name: "Báo cáo tình trạng sức khỏe học sinh",
    description: "Thống kê tình trạng sức khỏe học sinh theo lớp, khối",
    icon: "fas fa-heartbeat",
  },
  {
    id: "medical_exams",
    name: "Báo cáo khám sức khỏe định kỳ",
    description: "Tổng hợp kết quả khám sức khỏe định kỳ theo đợt",
    icon: "fas fa-stethoscope",
  },
  {
    id: "vaccination",
    name: "Báo cáo tiêm chủng",
    description: "Thống kê tình hình tiêm chủng của học sinh",
    icon: "fas fa-syringe",
  },
  {
    id: "illness",
    name: "Thống kê bệnh tật",
    description: "Phân tích tỷ lệ mắc bệnh thường gặp ở học sinh",
    icon: "fas fa-virus",
  },
  {
    id: "statistical",
    name: "Báo cáo thống kê",
    description: "Thống kê tổng hợp các chỉ số sức khỏe học đường",
    icon: "fas fa-chart-pie",
  },
];

const ReportGenerator = () => {
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [reportParams, setReportParams] = useState({
    startDate: "",
    endDate: "",
    grade: "",
    class: "",
    metric: "all",
  });

  const [generatedReport, setGeneratedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectReportType = (reportType) => {
    setSelectedReportType(reportType);
    setGeneratedReport(null);
  };

  const generateReport = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      setGeneratedReport({
        type: selectedReportType,
        params: { ...reportParams },
        data: {
          title: `${selectedReportType.name}`,
          dateGenerated: new Date().toLocaleString(),
          summary: {
            totalStudents: 1245,
            recordsAnalyzed: 980,
            highlights: [
              "78% học sinh có sức khỏe tốt",
              "12% học sinh cần theo dõi mắt",
              "5% học sinh cần theo dõi dinh dưỡng",
            ],
          },
        },
      });

      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="report-generator">
      <div className="section-header">
        <h2>Tạo báo cáo và thống kê</h2>
      </div>

      {!selectedReportType ? (
        <div className="report-types-grid">
          {reportTypes.map((reportType) => (
            <div
              className="report-type-card"
              key={reportType.id}
              onClick={() => selectReportType(reportType)}
            >
              <div className="report-type-icon">
                <i className={reportType.icon}></i>
              </div>
              <div className="report-type-info">
                <h3>{reportType.name}</h3>
                <p>{reportType.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="report-builder">
          <div className="report-builder-header">
            <button
              className="back-button"
              onClick={() => setSelectedReportType(null)}
            >
              <i className="fas fa-arrow-left"></i> Quay lại
            </button>
            <h3>
              <i className={selectedReportType.icon}></i>
              {selectedReportType.name}
            </h3>
          </div>

          <div className="report-content">
            {!generatedReport ? (
              <form className="report-params-form" onSubmit={generateReport}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Từ ngày</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={reportParams.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">Đến ngày</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={reportParams.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="grade">Khối</label>
                    <select
                      id="grade"
                      name="grade"
                      value={reportParams.grade}
                      onChange={handleInputChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="10">Khối 10</option>
                      <option value="11">Khối 11</option>
                      <option value="12">Khối 12</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="class">Lớp</label>
                    <select
                      id="class"
                      name="class"
                      value={reportParams.class}
                      onChange={handleInputChange}
                      disabled={!reportParams.grade}
                    >
                      <option value="">Tất cả</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="A3">A3</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="metric">Chỉ số phân tích</label>
                  <select
                    id="metric"
                    name="metric"
                    value={reportParams.metric}
                    onChange={handleInputChange}
                  >
                    <option value="all">Tất cả chỉ số</option>
                    <option value="bmi">Chỉ số BMI</option>
                    <option value="vision">Thị lực</option>
                    <option value="dental">Răng miệng</option>
                    <option value="general">Sức khỏe tổng quát</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="generate-report-button"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Đang tạo báo
                        cáo...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-file-medical-alt"></i> Tạo báo cáo
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="generated-report">
                <div className="report-header">
                  <h3>
                    <i className={generatedReport.type.icon}></i>
                    {generatedReport.data.title}
                  </h3>
                  <p className="report-generation-time">
                    Được tạo lúc: {generatedReport.data.dateGenerated}
                  </p>
                </div>

                <div className="report-summary">
                  <div className="summary-stats">
                    <div className="summary-stat">
                      <p className="stat-value">
                        {generatedReport.data.summary.totalStudents}
                      </p>
                      <p className="stat-label">Tổng số học sinh</p>
                    </div>
                    <div className="summary-stat">
                      <p className="stat-value">
                        {generatedReport.data.summary.recordsAnalyzed}
                      </p>
                      <p className="stat-label">Hồ sơ đã phân tích</p>
                    </div>
                  </div>

                  <div className="report-highlights">
                    <h4>Điểm nổi bật:</h4>
                    <ul>
                      {generatedReport.data.summary.highlights.map(
                        (highlight, index) => (
                          <li key={index}>{highlight}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <div className="report-visualization">
                  <div className="chart-placeholder">
                    {/* In a real app, you would use chart library like Chart.js here */}
                    <div className="mock-chart">
                      <div
                        className="chart-bar"
                        style={{ height: "70%", backgroundColor: "#4CAF50" }}
                      ></div>
                      <div
                        className="chart-bar"
                        style={{ height: "50%", backgroundColor: "#2196F3" }}
                      ></div>
                      <div
                        className="chart-bar"
                        style={{ height: "30%", backgroundColor: "#FFC107" }}
                      ></div>
                      <div
                        className="chart-bar"
                        style={{ height: "20%", backgroundColor: "#F44336" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <ReportExport report={generatedReport} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
