import React from "react";
import vaccineService from "../../../../../services/APIAdmin/vaccineService";
import "./VaccineDetailModal_new.css";

const VaccineDetailModal = ({ vaccine, onClose, theme = "blue" }) => {
  if (!vaccine) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusInfo = (isActive) => {
    return isActive
      ? {
          class: "active",
          icon: "fas fa-check-circle",
          text: "Đang sử dụng",
          description:
            "Vaccine này hiện đang được sử dụng trong chương trình tiêm chủng",
        }
      : {
          class: "inactive",
          icon: "fas fa-pause-circle",
          text: "Tạm dừng",
          description: "Vaccine này hiện tạm dừng sử dụng",
        };
  };

  const getDosageInfo = () => {
    if (vaccine.totalDoses === 1) {
      return {
        type: "Tiêm một lần",
        schedule: "Chỉ cần tiêm 1 liều duy nhất",
        interval: "Không có khoảng cách",
      };
    } else {
      return {
        type: `Tiêm ${vaccine.totalDoses} liều`,
        schedule: `Cần tiêm ${vaccine.totalDoses} liều để đạt hiệu quả tối ưu`,
        interval: `Khoảng cách giữa các liều: ${vaccine.intervalDays} ngày`,
      };
    }
  };

  const getAgeGroupInfo = () => {
    const minAge = vaccineService.monthsToAgeText(vaccine.minAgeMonths);
    const maxAge = vaccineService.monthsToAgeText(vaccine.maxAgeMonths);

    let category = "";
    let description = "";

    if (vaccine.maxAgeMonths <= 12) {
      category = "Trẻ sơ sinh";
      description = "Vaccine dành cho trẻ sơ sinh và trẻ nhỏ";
    } else if (vaccine.minAgeMonths <= 60 && vaccine.maxAgeMonths > 12) {
      category = "Trẻ em";
      description = "Vaccine dành cho trẻ em trong độ tuổi mầm non và tiểu học";
    } else if (vaccine.minAgeMonths > 60) {
      category = "Thiếu niên";
      description = "Vaccine dành cho thiếu niên và người trưởng thành";
    } else {
      category = "Đa độ tuổi";
      description = "Vaccine có thể sử dụng cho nhiều nhóm tuổi khác nhau";
    }

    return {
      category,
      range: `${minAge} - ${maxAge}`,
      description,
    };
  };

  const statusInfo = getStatusInfo(vaccine.isActive);
  const dosageInfo = getDosageInfo();
  const ageInfo = getAgeGroupInfo();

  return (
    <div
      className={`admin-vaccine-modal-backdrop theme-${theme}`}
      onClick={handleBackdropClick}
    >
      <div className="admin-vaccine-modal-container">
        <div className="admin-vaccine-modal-header">
          <div className="admin-vaccine-modal-title">
            <i className="fas fa-syringe"></i>
            <h2>Chi tiết vaccine</h2>
          </div>
          <button className="admin-vaccine-modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="admin-vaccine-modal-body">
          {/* Basic Information */}
          <div className="admin-vaccine-info-section">
            <h3>
              <i className="fas fa-info-circle"></i>
              Thông tin cơ bản
            </h3>
            <div className="admin-vaccine-info-grid">
              <div className="admin-vaccine-info-item admin-vaccine-full-width">
                <label>Tên vaccine:</label>
                <div className="admin-vaccine-name-display">
                  <strong>{vaccine.name}</strong>
                  <span
                    className={`admin-status-indicator ${statusInfo.class}`}
                  >
                    <i className={statusInfo.icon}></i>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              <div className="admin-vaccine-info-item admin-vaccine-full-width">
                <label>Mô tả:</label>
                <div className="admin-vaccine-description-box">
                  {vaccine.description}
                </div>
              </div>
            </div>
          </div>

          {/* Age Group Information */}
          <div className="admin-vaccine-info-section">
            <h3>
              <i className="fas fa-users"></i>
              Thông tin độ tuổi
            </h3>
            <div className="admin-vaccine-age-info-card">
              <div className="admin-vaccine-age-category">
                <span className="admin-vaccine-category-badge">
                  {ageInfo.category}
                </span>
                <span className="admin-vaccine-age-range">{ageInfo.range}</span>
              </div>
              <p className="admin-vaccine-age-description">
                {ageInfo.description}
              </p>
              <div className="admin-vaccine-age-details">
                <div className="admin-vaccine-age-detail-item">
                  <span className="admin-vaccine-label">
                    Độ tuổi tối thiểu:
                  </span>
                  <span className="admin-vaccine-value">
                    {vaccineService.monthsToAgeText(vaccine.minAgeMonths)}
                  </span>
                </div>
                <div className="admin-vaccine-age-detail-item">
                  <span className="admin-vaccine-label">Độ tuổi tối đa:</span>
                  <span className="admin-vaccine-value">
                    {vaccineService.monthsToAgeText(vaccine.maxAgeMonths)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dosage Information */}
          <div className="admin-vaccine-info-section">
            <h3>
              <i className="fas fa-calendar-alt"></i>
              Thông tin liều tiêm
            </h3>
            <div className="admin-vaccine-dosage-info-card">
              <div className="admin-vaccine-dosage-header">
                <span className="admin-vaccine-dosage-type">
                  {dosageInfo.type}
                </span>
                <span className="admin-vaccine-total-doses">
                  {vaccine.totalDoses} liều
                </span>
              </div>
              <p className="admin-vaccine-dosage-description">
                {dosageInfo.schedule}
              </p>
              <div className="admin-vaccine-dosage-details">
                <div className="admin-vaccine-dosage-detail-item">
                  <i className="fas fa-syringe"></i>
                  <div>
                    <span className="admin-vaccine-label">Tổng số liều:</span>
                    <span className="admin-vaccine-value">
                      {vaccine.totalDoses} liều
                    </span>
                  </div>
                </div>
                <div className="admin-vaccine-dosage-detail-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <span className="admin-vaccine-label">Khoảng cách:</span>
                    <span className="admin-vaccine-value">
                      {vaccine.intervalDays > 0
                        ? `${vaccine.intervalDays} ngày`
                        : "Không có khoảng cách"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="admin-vaccine-info-section">
            <h3>
              <i className="fas fa-toggle-on"></i>
              Trạng thái sử dụng
            </h3>
            <div
              className={`admin-vaccine-status-info-card ${statusInfo.class}`}
            >
              <div className="admin-vaccine-status-header">
                <i className={statusInfo.icon}></i>
                <span className="admin-vaccine-status-text">
                  {statusInfo.text}
                </span>
              </div>
              <p className="admin-vaccine-status-description">
                {statusInfo.description}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="admin-vaccine-info-section">
            <h3>
              <i className="fas fa-notes-medical"></i>
              Thông tin bổ sung
            </h3>
            <div className="admin-vaccine-additional-info">
              <div className="admin-vaccine-info-row">
                <span className="admin-vaccine-label">Mã vaccine:</span>
                <span className="admin-vaccine-value">
                  VCN-{String(vaccine.id).padStart(4, "0")}
                </span>
              </div>
              <div className="admin-vaccine-info-row">
                <span className="admin-vaccine-label">Loại vaccine:</span>
                <span className="admin-vaccine-value">
                  {vaccine.totalDoses === 1
                    ? "Vaccine một liều"
                    : "Vaccine đa liều"}
                </span>
              </div>
              <div className="admin-vaccine-info-row">
                <span className="admin-vaccine-label">
                  Phân loại theo tuổi:
                </span>
                <span className="admin-vaccine-value">{ageInfo.category}</span>
              </div>
              <div className="admin-vaccine-info-row">
                <span className="admin-vaccine-label">Tình trạng:</span>
                <span
                  className={`admin-vaccine-value admin-vaccine-status-${statusInfo.class}`}
                >
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </div>

          {/* Manufacturer Information */}
          <div className="admin-vaccine-info-section">
            <h3>
              <i className="fas fa-industry"></i>
              Thông tin nhà sản xuất
            </h3>
            <div className="admin-manufacturer-card">
              <div className="admin-manufacturer-name">
                <i className="fas fa-building"></i>
                {vaccine.manufacturer || "Pfizer-BioNTech"}
              </div>
              <div className="admin-manufacturer-country">
                <i className="fas fa-globe"></i>
                {vaccine.country || "Hoa Kỳ"}
              </div>
            </div>
          </div>

          {/* Storage Requirements */}
          <div className="admin-vaccine-info-section">
            <h3>
              <i className="fas fa-thermometer-half"></i>
              Yêu cầu bảo quản
            </h3>
            <div className="admin-storage-requirements">
              <div className="admin-storage-title">
                <i className="fas fa-snowflake"></i>
                Điều kiện bảo quản vaccine
              </div>
              <div className="admin-storage-grid">
                <div className="admin-storage-item">
                  <i className="fas fa-thermometer-half"></i>
                  <strong>Nhiệt độ</strong>
                  <span>{vaccine.storageTemp || "2°C - 8°C"}</span>
                </div>
                <div className="admin-storage-item">
                  <i className="fas fa-tint"></i>
                  <strong>Độ ẩm</strong>
                  <span>{vaccine.humidity || "< 60%"}</span>
                </div>
                <div className="admin-storage-item">
                  <i className="fas fa-sun"></i>
                  <strong>Ánh sáng</strong>
                  <span>Tránh ánh sáng trực tiếp</span>
                </div>
                <div className="admin-storage-item">
                  <i className="fas fa-calendar-times"></i>
                  <strong>Hạn sử dụng</strong>
                  <span>{vaccine.expiryDate || "24 tháng"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-vaccine-modal-footer">
          <div className="admin-vaccine-modal-info">
            <i className="fas fa-info-circle"></i>
            <span>Thông tin vaccine được cập nhật từ hệ thống</span>
          </div>
          <div className="admin-vaccine-modal-actions">
            <button
              className="admin-vaccine-modal-print-btn"
              onClick={() => window.print()}
              title="In thông tin vaccine"
            >
              <i className="fas fa-print"></i>
              In
            </button>
            <button
              className="admin-vaccine-modal-footer-close-btn"
              onClick={onClose}
              title="Đóng modal"
            >
              <i className="fas fa-times"></i>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccineDetailModal;
