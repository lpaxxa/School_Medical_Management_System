import React from 'react';
import './VaccinationDetailModal.css';

const VaccinationDetailModal = ({ isOpen, onClose, vaccination, onEdit }) => {
  if (!isOpen || !vaccination) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết tiêm chủng</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="detail-header">
            <h3 className="vaccination-title">{vaccination.tenVaccine}</h3>
            <span className={`status-badge ${getStatusClass(vaccination.trangThai)}`}>
              {vaccination.trangThai}
            </span>
          </div>
          
          <div className="detail-section">
            <div className="detail-row">
              <div className="detail-group">
                <span className="detail-label">ID</span>
                <span className="detail-value">{vaccination.id}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Nhà cung cấp</span>
                <span className="detail-value">{vaccination.nhaCanXuat}</span>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-group">
                <span className="detail-label">Số lô</span>
                <span className="detail-value">{vaccination.soLo}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Hạn sử dụng</span>
                <span className="detail-value">{vaccination.hanSuDung}</span>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-group">
                <span className="detail-label">Số lượng</span>
                <span className="detail-value">{vaccination.soLuong}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Đối tượng</span>
                <span className="detail-value">{vaccination.doiTuong}</span>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-group">
                <span className="detail-label">Ngày nhập</span>
                <span className="detail-value">{vaccination.ngayNhap}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Người nhập</span>
                <span className="detail-value">{vaccination.nguoiNhap || 'Không có thông tin'}</span>
              </div>
            </div>
            
            <div className="detail-note">
              <span className="detail-label">Ghi chú</span>
              <p className="detail-value">{vaccination.ghiChu || 'Không có ghi chú'}</p>
            </div>
          </div>
          
          <div className="detail-actions">
            <button className="btn-cancel" onClick={onClose}>Đóng</button>
            <button className="btn-edit" onClick={onEdit}>
              <i className="fas fa-edit"></i> Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for status class
function getStatusClass(trangThai) {
  switch(trangThai) {
    case 'Đang sử dụng':
      return 'status-active';
    case 'Sắp hết hàng':
      return 'status-warning';
    case 'Hết hạn':
      return 'status-expired';
    case 'Ngừng sử dụng':
      return 'status-inactive';
    default:
      return '';
  }
}

export default VaccinationDetailModal;
