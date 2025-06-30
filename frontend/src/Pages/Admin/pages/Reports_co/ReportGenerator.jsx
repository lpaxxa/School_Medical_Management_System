import React, { useState, useEffect } from "react";
import "./ReportGenerator.css";
import ReportTypeSelector from "./components/ReportTypeSelector";
import ReportDisplay from "./components/ReportDisplay";
import DetailView from "./components/DetailView";
import NotificationDetail from "./components/NotificationDetail";
import StudentListView from "./components/StudentListView";
import StudentDetailView from "./components/StudentDetailView";
import MedicationListView from "./components/MedicationListView";
import { reportService } from "./services/reportService";

const ReportGenerator = () => {
  const [reportType, setReportType] = useState("health");
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // States cho detail view
  const [detailData, setDetailData] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);

  // State cho notification và student detail
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // State để theo dõi loại data đang xem (notification hoặc student)
  const [detailViewType, setDetailViewType] = useState(null); // 'notification' hoặc 'student'

  const generateReport = async () => {
    console.log("Generating report:", { reportType });

    setIsLoading(true);
    setError(null);
    setShowDetailView(false);
    setSelectedNotification(null);
    setSelectedStudent(null);
    setDetailViewType(null);

    try {
      let reportData;

      switch (reportType) {
        case "vaccination":
          reportData = await reportService.getVaccinationReport();
          break;
        case "checkup":
          reportData = await reportService.getCheckupReport();
          break;
        case "health":
          reportData = reportService.getHealthReport();
          break;
        case "medication":
          reportData = await reportService.getMedicationReport();
          break;
        default:
          throw new Error("Loại báo cáo không hỗ trợ");
      }

      setGeneratedReport(reportData);
    } catch (err) {
      console.error("Error generating report:", err);
      setError(err.message || "Không thể tạo báo cáo. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const viewDetailData = async () => {
    setIsLoadingDetail(true);
    setError(null);

    try {
      let rawData;

      if (reportType === "health") {
        setDetailViewType("student");
        // Gọi API lấy danh sách học sinh
        const response = await fetch("http://localhost:8080/api/v1/students");
        if (!response.ok) {
          throw new Error("Không thể kết nối đến máy chủ");
        }
        rawData = await response.json();
      } else if (reportType === "medication") {
        setDetailViewType("medication");
        // Lấy dữ liệu thuốc từ API
        rawData = await reportService.getMedicationDetailData();
      } else {
        setDetailViewType("notification");
        // Lấy dữ liệu thông báo cho các báo cáo khác
        if (reportType === "vaccination") {
          rawData = await reportService.getVaccinationDetailData();
        } else if (reportType === "checkup") {
          rawData = await reportService.getCheckupDetailData();
        }
      }

      setDetailData(rawData);
      setShowDetailView(true);
      setSelectedNotification(null);
      setSelectedStudent(null);
    } catch (err) {
      console.error("Error fetching detail data:", err);
      setError(
        err.message || "Không thể tải chi tiết dữ liệu. Vui lòng thử lại."
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Hàm xử lý nút quay lại từ DetailView
  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setDetailViewType(null);
  };

  const handleViewDetail = (item) => {
    if (detailViewType === "student") {
      setSelectedStudent(item);
    } else {
      setSelectedNotification(item);
    }
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setSelectedNotification(null);
  };

  return (
    <div className="reports-container">
      <div className="reports-main-header">
        <div className="reports-header-content">
          <div className="reports-header-text">
            <h1>
              <i className="fas fa-chart-bar"></i> Báo cáo & Thống kê
            </h1>
            <p>
              Tạo và xem các báo cáo thống kê về sức khỏe học sinh và hoạt động
              của hệ thống
            </p>
          </div>
          <div className="reports-header-stats">
            <div className="reports-stat-item">
              <span className="reports-stat-number">4</span>
              <span className="reports-stat-label">Loại báo cáo</span>
            </div>
          </div>
        </div>
      </div>

      {!showDetailView && !selectedNotification && !selectedStudent && (
        <div className="reports-generator">
          <h2 className="reports-generator-title">Tạo báo cáo mới</h2>
          <ReportTypeSelector
            reportType={reportType}
            setReportType={setReportType}
          />
          <div className="reports-action-buttons">
            <button
              className="reports-btn reports-btn-primary"
              onClick={generateReport}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner reports-loading-spinner"></i>{" "}
                  Đang tạo...
                </>
              ) : (
                <>
                  <i className="fas fa-chart-line"></i> Tạo báo cáo
                </>
              )}
            </button>
            <button
              className="reports-btn reports-btn-secondary"
              onClick={viewDetailData}
              disabled={isLoadingDetail}
            >
              {isLoadingDetail ? (
                <>
                  <i className="fas fa-spinner reports-loading-spinner"></i>{" "}
                  Đang tải...
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i> Xem chi tiết
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="reports-error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
        </div>
      )}

      {/* Hiển thị báo cáo */}
      {generatedReport &&
        !showDetailView &&
        !selectedNotification &&
        !selectedStudent && <ReportDisplay report={generatedReport} />}

      {/* Hiển thị view chi tiết theo loại */}
      {showDetailView &&
        detailData &&
        !selectedNotification &&
        !selectedStudent &&
        (detailViewType === "student" ? (
          <StudentListView
            students={detailData}
            isLoading={isLoadingDetail}
            onViewDetail={handleViewDetail}
            onBack={handleBackFromDetail}
          />
        ) : detailViewType === "medication" ? (
          <MedicationListView onBack={handleBackFromDetail} />
        ) : (
          <DetailView
            data={detailData}
            reportType={reportType}
            isLoading={isLoadingDetail}
            onViewDetail={handleViewDetail}
            onBack={handleBackFromDetail}
          />
        ))}

      {/* Hiển thị chi tiết thông báo hoặc học sinh */}
      {selectedNotification && (
        <NotificationDetail
          notification={selectedNotification}
          onBack={handleBackToList}
        />
      )}

      {selectedStudent && (
        <StudentDetailView
          student={selectedStudent}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default ReportGenerator;
