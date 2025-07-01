import React from "react";
import "./MedicationDetailModal.css";

const MedicationDetailModal = ({ medication, onClose }) => {
  if (!medication) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    <div className="medication-modal-overlay" onClick={handleOverlayClick}>
      <div className="medication-modal">
        <div className="modal-header">
          <div className="modal-title">
            <i className="fas fa-pills"></i>
            <h2>Chi tiết thuốc và vật tư y tế</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Basic Information */}
          <div className="info-section">
            <h3>
              <i className="fas fa-info-circle"></i>
              Thông tin cơ bản
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>ID:</label>
                <span className="medication-id-badge">{medication.itemId}</span>
              </div>
              <div className="info-item">
                <label>Tên thuốc/vật tư:</label>
                <span className="medication-name">{medication.itemName}</span>
              </div>
              <div className="info-item">
                <label>Loại:</label>
                <span className="medication-type">{medication.itemType}</span>
              </div>
              <div className="info-item">
                <label>Đơn vị tính:</label>
                <span>{medication.unit}</span>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="info-section">
            <h3>
              <i className="fas fa-warehouse"></i>
              Thông tin tồn kho
            </h3>
            <div className="stock-info">
              <div className="stock-item">
                <div className="stock-icon">
                  <i className={stockStatus.icon}></i>
                </div>
                <div className="stock-details">
                  <span className="stock-quantity">
                    {medication.stockQuantity} {medication.unit}
                  </span>
                  <span className={`stock-status ${stockStatus.class}`}>
                    {stockStatus.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="info-section">
            <h3>
              <i className="fas fa-calendar-alt"></i>
              Thông tin ngày tháng
            </h3>
            <div className="date-grid">
              <div className="date-item">
                <label>Ngày sản xuất:</label>
                <span>{formatDate(medication.manufactureDate)}</span>
              </div>
              <div className="date-item">
                <label>Ngày hết hạn:</label>
                <div className="expiry-info">
                  <span>{formatDate(medication.expiryDate)}</span>
                  <span className={`expiry-status ${expiryStatus.class}`}>
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
              <div className="date-item">
                <label>Ngày nhập kho:</label>
                <span>{formatDateTime(medication.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="info-section">
            <h3>
              <i className="fas fa-file-text"></i>
              Mô tả chi tiết
            </h3>
            <div className="description">
              <p>{medication.itemDescription}</p>
            </div>
          </div>

          {/* Alerts */}
          {(stockStatus.class !== "in-stock" ||
            expiryStatus.class !== "expiry-good") && (
            <div className="info-section alerts">
              <h3>
                <i className="fas fa-bell"></i>
                Cảnh báo
              </h3>
              <div className="alert-list">
                {stockStatus.class === "out-of-stock" && (
                  <div className="alert-item danger">
                    <i className="fas fa-times-circle"></i>
                    <span>Hết hàng! Cần nhập thêm ngay lập tức</span>
                  </div>
                )}
                {stockStatus.class === "low-stock" && (
                  <div className="alert-item warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Tồn kho thấp! Cần chuẩn bị nhập thêm</span>
                  </div>
                )}
                {expiryStatus.class === "expired" && (
                  <div className="alert-item danger">
                    <i className="fas fa-ban"></i>
                    <span>
                      Đã hết hạn {expiryStatus.days} ngày! Không được sử dụng
                    </span>
                  </div>
                )}
                {expiryStatus.class === "expiring-soon" && (
                  <div className="alert-item warning">
                    <i className="fas fa-clock"></i>
                    <span>Sắp hết hạn trong {expiryStatus.days} ngày!</span>
                  </div>
                )}
                {expiryStatus.class === "expiring-warning" && (
                  <div className="alert-item info">
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

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            <i className="fas fa-times"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationDetailModal;
