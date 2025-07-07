import React from "react";
import {
  FaTimes,
  FaUserGraduate,
  FaSyringe,
  FaExclamationCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserMd,
  FaClipboardList,
  FaCalendarCheck,
  FaStickyNote,
  FaIdCard,
  FaGraduationCap,
  FaShieldAlt,
  FaInfoCircle,
  FaSpinner,
  FaAward,
  FaHeartbeat,
  FaCheckCircle,
  FaCertificate,
  FaVial,
  FaUser,
  FaSchool,
  FaMedal,
  FaBell,
  FaCalendarPlus,
} from "react-icons/fa";
import { formatDate, formatDateTime } from "../../utils/formatters";
import { modalClasses } from "../../utils/helpers";

const VaccinationModal = ({
  isOpen,
  onClose,
  isLoading,
  error,
  vaccinationDetail,
}) => {
  if (!isOpen) return null;

  // Debug log
  console.log("🔍 VaccinationModal render with props:", {
    isOpen,
    isLoading,
    error,
    vaccinationDetail,
    vaccinationDetailType: typeof vaccinationDetail,
    vaccinationDetailKeys: vaccinationDetail
      ? Object.keys(vaccinationDetail)
      : null,
  });

  const {
    modalOverlayClass,
    modalContentClass,
    modalHeaderClass,
    modalBodyClass,
    closeModalBtnClass,
  } = modalClasses;

  const getDoseStatus = (doseNumber) => {
    if (!doseNumber)
      return {
        status: "Chưa xác định",
        color: "#6b7280",
        bgColor: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
        icon: "❓",
      };
    const dose = parseInt(doseNumber);
    if (dose === 1)
      return {
        status: "Mũi cơ bản",
        color: "#3b82f6",
        bgColor: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
        icon: "🛡️",
      };
    if (dose <= 3)
      return {
        status: "Mũi nhắc lại",
        color: "#10b981",
        bgColor: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        icon: "🔄",
      };
    return {
      status: "Mũi bổ sung",
      color: "#f59e0b",
      bgColor: "linear-gradient(135deg, #fef3c7, #fde68a)",
      icon: "➕",
    };
  };

  const getVaccineTypeColor = (vaccineName) => {
    if (!vaccineName) return "#6b7280";
    const name = vaccineName.toLowerCase();
    if (name.includes("covid")) return "#ef4444";
    if (name.includes("cúm")) return "#3b82f6";
    if (name.includes("viêm gan")) return "#f59e0b";
    if (name.includes("bạch hầu")) return "#8b5cf6";
    return "#10b981";
  };

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div
        className="modern-modal-content vaccination-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className="modern-modal-header">
          <div className="modal-header-main">
            <div className="header-icon-container vaccination-header">
              <FaSyringe className="header-main-icon" />
              <div className="icon-pulse vaccination-pulse"></div>
            </div>
            <div className="header-content">
              <h2>Chi tiết tiêm chủng</h2>
              <p className="header-subtitle">
                <FaShieldAlt /> Thông tin chi tiết về vắc xin đã tiêm
              </p>
            </div>
          </div>
          <button className="modern-close-btn" onClick={onClose}>
            <FaTimes />
            <span className="close-btn-tooltip">Đóng</span>
          </button>
        </div>

        {/* Enhanced Body */}
        <div className="modern-modal-body">
          {isLoading ? (
            <div className="modern-loading-state">
              <div className="loading-icon-wrapper">
                <FaSpinner className="loading-icon spinning" />
                <div className="loading-pulse"></div>
              </div>
              <div className="loading-content">
                <h3>Đang tải thông tin...</h3>
                <p>Vui lòng chờ trong giây lát</p>
              </div>
            </div>
          ) : error ? (
            <div className="modern-error-state">
              <div className="error-icon-wrapper">
                <FaExclamationCircle className="error-icon" />
              </div>
              <div className="error-content">
                <h3>Lỗi tải dữ liệu</h3>
                <p>{error}</p>
                <button
                  className="retry-btn-modern"
                  onClick={() => window.location.reload()}
                >
                  <FaSpinner />
                  Thử lại
                </button>
              </div>
            </div>
          ) : vaccinationDetail ? (
            <div className="vaccination-detail-content-modern">
              {/* Student Information */}
              <div className="modern-section">
                <div className="section-header-modern">
                  <div className="section-icon-wrapper">
                    <FaUser />
                  </div>
                  <h3>Thông tin học sinh</h3>
                </div>

                <div className="student-info-modern-grid">
                  <div className="modern-student-card name">
                    <div className="student-card-icon">
                      <FaUserGraduate />
                    </div>
                    <div className="student-card-content">
                      <span className="student-card-label">Họ tên</span>
                      <span className="student-card-value">
                        {vaccinationDetail.studentName || "Không có thông tin"}
                      </span>
                    </div>
                    <div className="student-card-decoration"></div>
                  </div>

                  <div className="modern-student-card id">
                    <div className="student-card-icon">
                      <FaIdCard />
                    </div>
                    <div className="student-card-content">
                      <span className="student-card-label">Mã học sinh</span>
                      <span className="student-card-value">
                        {vaccinationDetail.studentId || "Không có thông tin"}
                      </span>
                    </div>
                    <div className="student-card-decoration"></div>
                  </div>

                  <div className="modern-student-card class">
                    <div className="student-card-icon">
                      <FaSchool />
                    </div>
                    <div className="student-card-content">
                      <span className="student-card-label">Lớp</span>
                      <span className="student-card-value">
                        {vaccinationDetail.className || "Không có thông tin"}
                      </span>
                    </div>
                    <div className="student-card-decoration"></div>
                  </div>
                </div>
              </div>

              {/* Vaccine Information */}
              <div className="modern-section">
                <div className="section-header-modern">
                  <div className="section-icon-wrapper">
                    <FaVial />
                  </div>
                  <h3>Thông tin vắc xin</h3>
                </div>

                {/* Main Vaccine Card */}
                <div
                  className="vaccine-main-card-modern"
                  style={{
                    background: `linear-gradient(135deg, ${getVaccineTypeColor(
                      vaccinationDetail.vaccineName
                    )}20, ${getVaccineTypeColor(
                      vaccinationDetail.vaccineName
                    )}10)`,
                  }}
                >
                  <div className="vaccine-main-header">
                    <div
                      className="vaccine-main-icon"
                      style={{
                        backgroundColor: getVaccineTypeColor(
                          vaccinationDetail.vaccineName
                        ),
                      }}
                    >
                      <FaShieldAlt />
                    </div>
                    <div className="vaccine-main-content">
                      <h4 className="vaccine-main-title">
                        {vaccinationDetail.vaccineName || "Không có thông tin"}
                      </h4>
                      {vaccinationDetail.doseNumber && (
                        <div
                          className="dose-badge-modern"
                          style={{
                            background: getDoseStatus(
                              vaccinationDetail.doseNumber
                            ).bgColor,
                            color: getDoseStatus(vaccinationDetail.doseNumber)
                              .color,
                            border: `1px solid ${
                              getDoseStatus(vaccinationDetail.doseNumber).color
                            }30`,
                          }}
                        >
                          <span className="dose-emoji">
                            {getDoseStatus(vaccinationDetail.doseNumber).icon}
                          </span>
                          <span>Mũi thứ {vaccinationDetail.doseNumber}</span>
                          <span className="dose-type">
                            {getDoseStatus(vaccinationDetail.doseNumber).status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="vaccine-main-decoration"></div>
                </div>

                {/* Vaccination Details Grid */}
                <div className="vaccination-details-modern-grid">
                  <div className="modern-vaccine-detail-card date">
                    <div className="detail-card-header">
                      <FaCalendarAlt className="detail-icon" />
                      <span className="detail-title">Ngày tiêm</span>
                    </div>
                    <div className="detail-card-content">
                      <span className="detail-value">
                        {vaccinationDetail.vaccinationDate
                          ? formatDateTime(vaccinationDetail.vaccinationDate)
                          : "Không có thông tin"}
                      </span>
                    </div>
                  </div>

                  <div className="modern-vaccine-detail-card location">
                    <div className="detail-card-header">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span className="detail-title">Địa điểm</span>
                    </div>
                    <div className="detail-card-content">
                      <span className="detail-value">
                        {vaccinationDetail.administeredAt ||
                          "Không có thông tin"}
                      </span>
                    </div>
                  </div>

                  <div className="modern-vaccine-detail-card doctor">
                    <div className="detail-card-header">
                      <FaUserMd className="detail-icon" />
                      <span className="detail-title">Người thực hiện</span>
                    </div>
                    <div className="detail-card-content">
                      <span className="detail-value">
                        {vaccinationDetail.administeredBy ||
                          "Không có thông tin"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Dose Card */}
                {vaccinationDetail.nextDoseDate && (
                  <div className="next-dose-modern-card">
                    <div className="next-dose-header">
                      <div className="next-dose-icon-wrapper">
                        <FaCalendarPlus />
                        <div className="icon-glow"></div>
                      </div>
                      <div className="next-dose-content">
                        <h4>Lịch tiêm kế tiếp</h4>
                        <p className="next-dose-date-modern">
                          {formatDate(vaccinationDetail.nextDoseDate)}
                        </p>
                      </div>
                    </div>
                    <div className="next-dose-reminder-modern">
                      <FaBell className="reminder-icon" />
                      <span>
                        Vui lòng đưa con đến đúng hẹn để đảm bảo hiệu quả vắc
                        xin
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {vaccinationDetail.notes && (
                  <div className="notes-modern-section">
                    <div className="notes-header-modern">
                      <FaStickyNote className="notes-icon-modern" />
                      <h4>Ghi chú</h4>
                    </div>
                    <div className="notes-content-modern">
                      <p>{vaccinationDetail.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Section */}
              <div className="modern-section">
                <div className="section-header-modern">
                  <div className="section-icon-wrapper">
                    <FaMedal />
                  </div>
                  <h3>Tóm tắt thông tin</h3>
                </div>

                <div className="summary-modern-grid">
                  <div className="modern-summary-card completed">
                    <div className="summary-card-icon">
                      <FaCheckCircle />
                    </div>
                    <div className="summary-card-content">
                      <span className="summary-card-label">Trạng thái</span>
                      <span className="summary-card-value">Đã hoàn thành</span>
                    </div>
                    <div className="summary-card-status completed"></div>
                  </div>

                  <div className="modern-summary-card active">
                    <div className="summary-card-icon">
                      <FaHeartbeat />
                    </div>
                    <div className="summary-card-content">
                      <span className="summary-card-label">Hiệu lực</span>
                      <span className="summary-card-value">Đang hoạt động</span>
                    </div>
                    <div className="summary-card-status active"></div>
                  </div>

                  {vaccinationDetail.nextDoseDate && (
                    <div className="modern-summary-card reminder">
                      <div className="summary-card-icon">
                        <FaCalendarCheck />
                      </div>
                      <div className="summary-card-content">
                        <span className="summary-card-label">Theo dõi</span>
                        <span className="summary-card-value">Có lịch hẹn</span>
                      </div>
                      <div className="summary-card-status reminder"></div>
                    </div>
                  )}

                  <div className="modern-summary-card certificate">
                    <div className="summary-card-icon">
                      <FaCertificate />
                    </div>
                    <div className="summary-card-content">
                      <span className="summary-card-label">Chứng nhận</span>
                      <span className="summary-card-value">Hợp lệ</span>
                    </div>
                    <div className="summary-card-status certificate"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="modern-no-data-state">
              <div className="no-data-icon-wrapper">
                <FaInfoCircle className="no-data-icon" />
                <div className="no-data-pulse"></div>
              </div>
              <div className="no-data-content">
                <h3>Không có thông tin chi tiết</h3>
                <p>Thông tin chi tiết về mũi tiêm này hiện chưa có sẵn.</p>
                <button className="back-btn-modern" onClick={onClose}>
                  <FaTimes />
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationModal;
