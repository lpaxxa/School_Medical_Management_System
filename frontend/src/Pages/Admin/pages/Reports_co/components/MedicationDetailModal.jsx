import React from "react";
import "./MedicationDetailModal.css";
import { formatDate, formatDateTimeLocale } from "../../../utils/dateUtils";

const MedicationDetailModal = ({ medication, onClose }) => {
  if (!medication) return null;

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return {
        class: "out-of-stock",
        text: "Hết hàng",
        icon: "fas fa-times-circle",
      };
    if (quantity < 20)
      return {
        class: "low-stock",
        text: "Sắp hết",
        icon: "fas fa-exclamation-triangle",
      };
    return { class: "in-stock", text: "Còn hàng", icon: "fas fa-check-circle" };
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    // Check if expiry date is valid
    if (isNaN(expiry.getTime())) {
      return {
        class: "expired",
        text: "Ngày không hợp lệ",
        icon: "fas fa-ban",
        days: 0,
      };
    }

    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0)
      return {
        class: "expired",
        text: "Đã hết hạn",
        icon: "fas fa-ban",
        days: Math.abs(daysUntilExpiry),
      };
    if (daysUntilExpiry <= 30)
      return {
        class: "expiring-soon",
        text: "Sắp hết hạn",
        icon: "fas fa-exclamation-triangle",
        days: daysUntilExpiry,
      };
    if (daysUntilExpiry <= 180)
      return {
        class: "expiring-warning",
        text: "Cần theo dõi",
        icon: "fas fa-clock",
        days: daysUntilExpiry,
      };
    return {
      class: "expiry-good",
      text: "Còn hạn",
      icon: "fas fa-calendar-check",
      days: daysUntilExpiry,
    };
  };

  const stockStatus = getStockStatus(medication.stockQuantity);
  const expiryStatus = getExpiryStatus(medication.expiryDate);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="reports-medication-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="reports-medication-modal">
        <div className="reports-medication-modal-header">
          <div className="reports-medication-modal-title">
            <i className="fas fa-pills"></i>
            <h2>Chi tiết thuốc và vật tư y tế</h2>
          </div>
          <button className="reports-medication-close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="reports-medication-modal-body">
          {/* Basic Information */}
          <div className="reports-medication-info-section">
            <h3>
              <i className="fas fa-info-circle"></i>
              Thông tin cơ bản
            </h3>
            <div className="reports-medication-info-grid">
              <div className="reports-medication-info-item">
                <label>ID:</label>
                <span className="reports-medication-id-badge">
                  {medication.itemId}
                </span>
              </div>
              <div className="reports-medication-info-item">
                <label>Tên thuốc/vật tư:</label>
                <span className="reports-medication-name">
                  {medication.itemName}
                </span>
              </div>
              <div className="reports-medication-info-item">
                <label>Loại:</label>
                <span className="reports-medication-type">
                  {medication.itemType}
                </span>
              </div>
              <div className="reports-medication-info-item">
                <label>Đơn vị tính:</label>
                <span>{medication.unit}</span>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="reports-medication-info-section">
            <h3>
              <i className="fas fa-warehouse"></i>
              Thông tin tồn kho
            </h3>
            <div className="reports-medication-stock-info">
              <div className="reports-medication-stock-item">
                <div className="reports-medication-stock-icon">
                  <i className={stockStatus.icon}></i>
                </div>
                <div className="reports-medication-stock-details">
                  <span className="reports-medication-stock-quantity">
                    {medication.stockQuantity} {medication.unit}
                  </span>
                  <span
                    className={`reports-medication-stock-status ${stockStatus.class}`}
                  >
                    {stockStatus.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="reports-medication-info-section">
            <h3>
              <i className="fas fa-calendar-alt"></i>
              Thông tin ngày tháng
            </h3>
            <div className="reports-medication-date-grid">
              <div className="reports-medication-date-item">
                <label>Ngày sản xuất:</label>
                <span>{formatDate(medication.manufactureDate)}</span>
              </div>
              <div className="reports-medication-date-item">
                <label>Ngày hết hạn:</label>
                <div className="reports-medication-expiry-info">
                  <span>{formatDate(medication.expiryDate)}</span>
                  <span
                    className={`reports-medication-expiry-status ${expiryStatus.class}`}
                  >
                    <i className={expiryStatus.icon}></i>
                    {expiryStatus.text}
                    {expiryStatus.days !== undefined && (
                      <small>
                        (
                        {expiryStatus.days > 0
                          ? `còn ${expiryStatus.days} ngày`
                          : `quá hạn ${expiryStatus.days} ngày`}
                        )
                      </small>
                    )}
                  </span>
                </div>
              </div>
              <div className="reports-medication-date-item">
                <label>Ngày nhập kho:</label>
                <span>{formatDateTimeLocale(medication.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="reports-medication-info-section">
            <h3>
              <i className="fas fa-file-text"></i>
              Mô tả chi tiết
            </h3>
            <div className="reports-medication-description">
              <p>{medication.itemDescription}</p>
            </div>
          </div>

          {/* Alerts */}
          {(stockStatus.class !== "in-stock" ||
            expiryStatus.class !== "expiry-good") && (
            <div className="reports-medication-info-section reports-medication-alerts">
              <h3>
                <i className="fas fa-bell"></i>
                Cảnh báo
              </h3>
              <div className="reports-medication-alert-list">
                {stockStatus.class === "out-of-stock" && (
                  <div className="reports-medication-alert-item reports-medication-danger">
                    <i className="fas fa-times-circle"></i>
                    <span>Hết hàng! Cần nhập thêm ngay lập tức</span>
                  </div>
                )}
                {stockStatus.class === "low-stock" && (
                  <div className="reports-medication-alert-item reports-medication-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Tồn kho thấp! Cần chuẩn bị nhập thêm</span>
                  </div>
                )}
                {expiryStatus.class === "expired" && (
                  <div className="reports-medication-alert-item reports-medication-danger">
                    <i className="fas fa-ban"></i>
                    <span>
                      Đã hết hạn {expiryStatus.days} ngày! Không được sử dụng
                    </span>
                  </div>
                )}
                {expiryStatus.class === "expiring-soon" && (
                  <div className="reports-medication-alert-item reports-medication-warning">
                    <i className="fas fa-clock"></i>
                    <span>Sắp hết hạn trong {expiryStatus.days} ngày!</span>
                  </div>
                )}
                {expiryStatus.class === "expiring-warning" && (
                  <div className="reports-medication-alert-item reports-medication-info">
                    <i className="fas fa-info-circle"></i>
                    <span>
                      Cần theo dõi hạn sử dụng (còn {expiryStatus.days} ngày)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="reports-medication-modal-footer">
          <button
            className="reports-medication-btn-secondary"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationDetailModal;
