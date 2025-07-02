import React from "react";
import {
  FaTimes,
  FaUserMd,
  FaHeartbeat,
  FaEye,
  FaRulerVertical,
  FaWeight,
  FaThermometerHalf,
  FaStethoscope,
  FaCalendarAlt,
  FaClipboardList,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBell,
  FaUser,
  FaNotesMedical,
  FaHeart,
  FaEyeDropper,
  FaStar,
  FaTrophy,
  FaAward,
} from "react-icons/fa";
import { formatDate } from "../../utils/formatters";

const CheckupModal = ({ isOpen, onClose, checkup }) => {
  if (!isOpen || !checkup) return null;

  const formatValue = (value, unit = "") => {
    return value ? `${value}${unit}` : "Chưa có thông tin";
  };

  const getBMIStatus = (bmi) => {
    if (!bmi)
      return {
        status: "Chưa có thông tin",
        color: "#6b7280",
        bgColor: "#f3f4f6",
      };
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5)
      return {
        status: "Thiếu cân",
        color: "#f59e0b",
        bgColor: "linear-gradient(135deg, #fef3c7, #fde68a)",
        icon: "⚠️",
      };
    if (bmiValue <= 24.9)
      return {
        status: "Bình thường",
        color: "#10b981",
        bgColor: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        icon: "✅",
      };
    if (bmiValue <= 29.9)
      return {
        status: "Thừa cân",
        color: "#f59e0b",
        bgColor: "linear-gradient(135deg, #fef3c7, #fde68a)",
        icon: "⚠️",
      };
    return {
      status: "Béo phì",
      color: "#ef4444",
      bgColor: "linear-gradient(135deg, #fee2e2, #fecaca)",
      icon: "⚠️",
    };
  };

  const getVisionStatus = (vision) => {
    if (!vision)
      return {
        status: "Chưa đánh giá",
        color: "#6b7280",
        bgColor: "#f3f4f6",
        icon: "❓",
      };
    if (vision.includes("10/10") || vision.includes("bình thường")) {
      return {
        status: "Tốt",
        color: "#10b981",
        bgColor: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        icon: "👁️",
      };
    }
    return {
      status: "Cần theo dõi",
      color: "#f59e0b",
      bgColor: "linear-gradient(135deg, #fef3c7, #fde68a)",
      icon: "👓",
    };
  };

  const getVitalStatus = (value, type) => {
    if (!value) return { color: "#6b7280", status: "normal" };

    if (type === "heartRate") {
      const rate = parseInt(value);
      if (rate < 60 || rate > 100)
        return { color: "#f59e0b", status: "warning" };
      return { color: "#10b981", status: "good" };
    }

    if (type === "temperature") {
      const temp = parseFloat(value);
      if (temp < 36 || temp > 37.5)
        return { color: "#f59e0b", status: "warning" };
      return { color: "#10b981", status: "good" };
    }

    return { color: "#3b82f6", status: "normal" };
  };

  const bmiStatus = getBMIStatus(checkup.bmi);
  const leftVisionStatus = getVisionStatus(checkup.visionLeft);
  const rightVisionStatus = getVisionStatus(checkup.visionRight);

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div
        className="modern-modal-content checkup-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className="modern-modal-header">
          <div className="modal-header-main">
            <div className="header-icon-container">
              <FaStethoscope className="header-main-icon" />
              <div className="icon-pulse"></div>
            </div>
            <div className="header-content">
              <h2>Chi tiết kiểm tra sức khỏe định kỳ</h2>
              <p className="header-subtitle">
                <FaCalendarAlt /> {formatDate(checkup.checkupDate)} •{" "}
                {checkup.checkupType || "Kiểm tra định kỳ"}
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
          {/* Basic Info Cards */}
          <div className="modern-section">
            <div className="section-header-modern">
              <div className="section-icon-wrapper">
                <FaClipboardList />
              </div>
              <h3>Thông tin cơ bản</h3>
            </div>

            <div className="info-cards-modern-grid">
              <div className="modern-info-card basic-info">
                <div className="card-icon-wrapper date-icon">
                  <FaCalendarAlt />
                </div>
                <div className="card-content">
                  <span className="card-label">Ngày khám</span>
                  <span className="card-value">
                    {formatDate(checkup.checkupDate)}
                  </span>
                </div>
                <div className="card-accent"></div>
              </div>

              <div className="modern-info-card basic-info">
                <div className="card-icon-wrapper type-icon">
                  <FaNotesMedical />
                </div>
                <div className="card-content">
                  <span className="card-label">Loại khám</span>
                  <span className="card-value">
                    {checkup.checkupType || "Kiểm tra định kỳ"}
                  </span>
                </div>
                <div className="card-accent"></div>
              </div>

              <div className="modern-info-card basic-info">
                <div className="card-icon-wrapper staff-icon">
                  <FaUserMd />
                </div>
                <div className="card-content">
                  <span className="card-label">Nhân viên y tế</span>
                  <span className="card-value">
                    {checkup.medicalStaffName || "Chưa có thông tin"}
                  </span>
                </div>
                <div className="card-accent"></div>
              </div>
            </div>
          </div>

          {/* Body Measurements */}
          <div className="modern-section">
            <div className="section-header-modern">
              <div className="section-icon-wrapper">
                <FaRulerVertical />
              </div>
              <h3>Chỉ số cơ thể</h3>
            </div>

            <div className="measurements-modern-grid">
              <div className="modern-measurement-card height">
                <div className="measurement-icon-wrapper">
                  <FaRulerVertical />
                </div>
                <div className="measurement-content">
                  <span className="measurement-label">Chiều cao</span>
                  <span className="measurement-value">
                    {formatValue(checkup.height, " cm")}
                  </span>
                  <div className="measurement-bar">
                    <div
                      className="measurement-progress"
                      style={{
                        width: checkup.height
                          ? `${Math.min(checkup.height / 2, 100)}%`
                          : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="modern-measurement-card weight">
                <div className="measurement-icon-wrapper">
                  <FaWeight />
                </div>
                <div className="measurement-content">
                  <span className="measurement-label">Cân nặng</span>
                  <span className="measurement-value">
                    {formatValue(checkup.weight, " kg")}
                  </span>
                  <div className="measurement-bar">
                    <div
                      className="measurement-progress"
                      style={{
                        width: checkup.weight
                          ? `${Math.min(checkup.weight * 1.5, 100)}%`
                          : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="modern-measurement-card bmi">
                <div
                  className="measurement-icon-wrapper"
                  style={{ color: bmiStatus.color }}
                >
                  <FaTrophy />
                </div>
                <div className="measurement-content">
                  <span className="measurement-label">Chỉ số BMI</span>
                  <div className="bmi-result">
                    <span className="measurement-value">
                      {formatValue(checkup.bmi)}
                    </span>
                    {checkup.bmi && (
                      <div
                        className="bmi-status-modern"
                        style={{
                          background: bmiStatus.bgColor,
                          color: bmiStatus.color,
                          border: `1px solid ${bmiStatus.color}30`,
                        }}
                      >
                        <span className="bmi-emoji">{bmiStatus.icon}</span>
                        <span>{bmiStatus.status}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="modern-section">
            <div className="section-header-modern">
              <div className="section-icon-wrapper">
                <FaHeart />
              </div>
              <h3>Dấu hiệu sinh tồn</h3>
            </div>

            <div className="vitals-modern-grid">
              <div className="modern-vital-card">
                <div className="vital-icon-wrapper bp">
                  <FaHeartbeat />
                </div>
                <div className="vital-content">
                  <span className="vital-label">Huyết áp</span>
                  <span className="vital-value">
                    {checkup.bloodPressure || "Chưa có thông tin"}
                  </span>
                  <div className="vital-status-indicator normal"></div>
                </div>
              </div>

              <div className="modern-vital-card">
                <div
                  className="vital-icon-wrapper hr"
                  style={{
                    color: getVitalStatus(checkup.heartRate, "heartRate").color,
                  }}
                >
                  <FaHeart />
                </div>
                <div className="vital-content">
                  <span className="vital-label">Nhịp tim</span>
                  <span className="vital-value">
                    {formatValue(checkup.heartRate, " lần/phút")}
                  </span>
                  <div
                    className={`vital-status-indicator ${
                      getVitalStatus(checkup.heartRate, "heartRate").status
                    }`}
                  ></div>
                </div>
              </div>

              <div className="modern-vital-card">
                <div
                  className="vital-icon-wrapper temp"
                  style={{
                    color: getVitalStatus(
                      checkup.bodyTemperature,
                      "temperature"
                    ).color,
                  }}
                >
                  <FaThermometerHalf />
                </div>
                <div className="vital-content">
                  <span className="vital-label">Thân nhiệt</span>
                  <span className="vital-value">
                    {formatValue(checkup.bodyTemperature, "°C")}
                  </span>
                  <div
                    className={`vital-status-indicator ${
                      getVitalStatus(checkup.bodyTemperature, "temperature")
                        .status
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Specialist Examinations */}
          <div className="modern-section">
            <div className="section-header-modern">
              <div className="section-icon-wrapper">
                <FaEyeDropper />
              </div>
              <h3>Khám chuyên khoa</h3>
            </div>

            <div className="specialist-modern-grid">
              <div className="modern-specialist-card">
                <div className="specialist-header">
                  <FaEye className="specialist-icon" />
                  <span className="specialist-title">Thị lực mắt trái</span>
                </div>
                <div className="specialist-result">
                  <span className="specialist-value">
                    {checkup.visionLeft || "Chưa có thông tin"}
                  </span>
                  {checkup.visionLeft && (
                    <div
                      className="vision-status-modern"
                      style={{
                        background: leftVisionStatus.bgColor,
                        color: leftVisionStatus.color,
                      }}
                    >
                      <span>{leftVisionStatus.icon}</span>
                      <span>{leftVisionStatus.status}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modern-specialist-card">
                <div className="specialist-header">
                  <FaEye className="specialist-icon" />
                  <span className="specialist-title">Thị lực mắt phải</span>
                </div>
                <div className="specialist-result">
                  <span className="specialist-value">
                    {checkup.visionRight || "Chưa có thông tin"}
                  </span>
                  {checkup.visionRight && (
                    <div
                      className="vision-status-modern"
                      style={{
                        background: rightVisionStatus.bgColor,
                        color: rightVisionStatus.color,
                      }}
                    >
                      <span>{rightVisionStatus.icon}</span>
                      <span>{rightVisionStatus.status}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modern-specialist-card">
                <div className="specialist-header">
                  <FaStethoscope className="specialist-icon" />
                  <span className="specialist-title">Thính lực</span>
                </div>
                <div className="specialist-result">
                  <span className="specialist-value">
                    {checkup.hearingStatus || "Chưa có thông tin"}
                  </span>
                  <div className="hearing-status-modern">
                    <span>🔊</span>
                    <span>Bình thường</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis & Recommendations */}
          {(checkup.diagnosis || checkup.recommendations) && (
            <div className="modern-section">
              <div className="section-header-modern">
                <div className="section-icon-wrapper">
                  <FaNotesMedical />
                </div>
                <h3>Chẩn đoán & Khuyến nghị</h3>
              </div>

              <div className="content-cards-modern">
                {checkup.diagnosis && (
                  <div className="modern-content-card diagnosis">
                    <div className="content-card-header">
                      <FaStethoscope />
                      <h4>Chẩn đoán</h4>
                    </div>
                    <div className="content-card-body">
                      <p>{checkup.diagnosis}</p>
                    </div>
                  </div>
                )}

                {checkup.recommendations && (
                  <div className="modern-content-card recommendations">
                    <div className="content-card-header">
                      <FaStar />
                      <h4>Khuyến nghị</h4>
                    </div>
                    <div className="content-card-body">
                      <p>{checkup.recommendations}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Summary */}
          <div className="modern-section">
            <div className="section-header-modern">
              <div className="section-icon-wrapper">
                <FaAward />
              </div>
              <h3>Tổng kết tình trạng</h3>
            </div>

            <div className="status-summary-modern">
              <div className="modern-status-card">
                <div
                  className={`status-icon-modern ${
                    checkup.followUpNeeded ? "warning" : "success"
                  }`}
                >
                  {checkup.followUpNeeded ? (
                    <FaExclamationTriangle />
                  ) : (
                    <FaCheckCircle />
                  )}
                </div>
                <div className="status-content">
                  <span className="status-label">Theo dõi</span>
                  <span
                    className={`status-value ${
                      checkup.followUpNeeded ? "warning" : "success"
                    }`}
                  >
                    {checkup.followUpNeeded ? "Cần theo dõi" : "Hoàn thành"}
                  </span>
                </div>
              </div>

              <div className="modern-status-card">
                <div
                  className={`status-icon-modern ${
                    checkup.parentNotified ? "success" : "warning"
                  }`}
                >
                  {checkup.parentNotified ? <FaCheckCircle /> : <FaBell />}
                </div>
                <div className="status-content">
                  <span className="status-label">Thông báo</span>
                  <span
                    className={`status-value ${
                      checkup.parentNotified ? "success" : "warning"
                    }`}
                  >
                    {checkup.parentNotified ? "Đã thông báo" : "Chưa thông báo"}
                  </span>
                </div>
              </div>

              <div className="modern-status-card">
                <div className="status-icon-modern info">
                  <FaUser />
                </div>
                <div className="status-content">
                  <span className="status-label">Trạng thái</span>
                  <span className="status-value info">Hoàn thành khám</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckupModal;
