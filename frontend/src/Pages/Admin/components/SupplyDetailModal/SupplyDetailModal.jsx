import React from 'react';
import './SupplyDetailModal.css';

const SupplyDetailModal = ({ isOpen, onClose, supply }) => {
  if (!isOpen || !supply) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="admin_ui_modal_overlay" onClick={handleOverlayClick}>
      <div className="admin_ui_supply_modal">
        {/* Header */}
        <div className="admin_ui_modal_header">
          <div className="admin_ui_modal_title">
            <span className="admin_ui_modal_icon">🏥</span>
            <h2>Chi tiết thuốc và vật tư y tế</h2>
          </div>
          <button className="admin_ui_modal_close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="admin_ui_modal_content">
          {/* Basic Info Section */}
          <div className="admin_ui_info_section">
            <div className="admin_ui_section_header">
              <span className="admin_ui_section_icon">ℹ️</span>
              <h3>Thông tin cơ bản</h3>
            </div>
            
            <div className="admin_ui_info_grid">
              <div className="admin_ui_info_item">
                <label>ID:</label>
                <div className="admin_ui_info_value admin_ui_id_badge">
                  {supply.id}
                </div>
              </div>
              <div className="admin_ui_info_item">
                <label>TÊN THUỐC/VẬT TƯ:</label>
                <div className="admin_ui_info_value admin_ui_name_value">
                  {supply.name}
                </div>
              </div>
              <div className="admin_ui_info_item">
                <label>LOẠI:</label>
                <div className={`admin_ui_category_tag admin_ui_category_${supply.category.toLowerCase()}`}>
                  {supply.category}
                </div>
              </div>
              <div className="admin_ui_info_item">
                <label>ĐƠN VỊ TÍNH:</label>
                <div className="admin_ui_info_value">
                  {supply.unit}
                </div>
              </div>
            </div>
          </div>

          {/* Stock Info Section */}
          <div className="admin_ui_info_section">
            <div className="admin_ui_section_header">
              <span className="admin_ui_section_icon">📦</span>
              <h3>Thông tin tồn kho</h3>
            </div>
            
            <div className="admin_ui_stock_display">
              <div className="admin_ui_stock_main">
                <div className="admin_ui_stock_number">{supply.quantity}</div>
                <div className="admin_ui_stock_unit">{supply.unit}</div>
              </div>
              <div className={`admin_ui_stock_status admin_ui_stock_${supply.stockStatus === 'Còn hạn' ? 'valid' : supply.stockStatus === 'Cần theo dõi' ? 'warning' : 'expired'}`}>
                <span className="admin_ui_status_icon">
                  {supply.stockStatus === 'Còn hạn' ? '✅' : supply.stockStatus === 'Cần theo dõi' ? '⚠️' : '❌'}
                </span>
                {supply.stockStatus.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Date Info Section */}
          <div className="admin_ui_info_section">
            <div className="admin_ui_section_header">
              <span className="admin_ui_section_icon">📅</span>
              <h3>Thông tin ngày tháng</h3>
            </div>
            
            <div className="admin_ui_date_grid">
              <div className="admin_ui_date_item">
                <label>NGÀY SẢN XUẤT:</label>
                <div className="admin_ui_date_value">01/01/2023</div>
              </div>
              <div className="admin_ui_date_item">
                <label>NGÀY HẾT HẠN:</label>
                <div className="admin_ui_date_value admin_ui_expiry_date">
                  {supply.expiryDate}
                </div>
              </div>
              <div className="admin_ui_date_item">
                <label>NGÀY NHẬP KHO:</label>
                <div className="admin_ui_date_value">10:00 01/01/2024</div>
              </div>
              <div className="admin_ui_date_item admin_ui_warning_item">
                <div className="admin_ui_warning_badge">
                  <span className="admin_ui_warning_icon">⚠️</span>
                  <span className="admin_ui_warning_text">CẦN THEO DÕI</span>
                  <span className="admin_ui_warning_detail">(CÒN 170 NGÀY)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="admin_ui_modal_footer">
          <button className="admin_ui_modal_btn admin_ui_btn_close" onClick={onClose}>
            ✕ Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplyDetailModal;
