import React from 'react';
import './CheckupDetailModal.css';

const CheckupDetailModal = ({ isOpen, onClose, checkup, onEdit }) => {
  if (!isOpen || !checkup) return null;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!checkup.soLuongHocSinh || checkup.soLuongHocSinh === 0) return 0;
    return Math.round((checkup.daKham / checkup.soLuongHocSinh) * 100);
  };

  // Get status color
  const getStatusColor = () => {
    switch (checkup.trangThai) {
      case 'Đã hoàn thành':
        return '#28a745'; // green
      case 'Đang thực hiện':
        return '#007bff'; // blue
      case 'Chưa bắt đầu':
        return '#6c757d'; // gray
      case 'Đã hủy':
        return '#dc3545'; // red
      default:
        return '#6c757d'; // default gray
    }
  };

  return (
    <div className="modal-overlay">
      <div className="checkup-detail-modal">
        <div className="modal-header">
          <h2>Chi tiết đợt kiểm tra sức khỏe</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-header">
            <h3>{checkup.tenDotKham}</h3>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor() }}
            >
              {checkup.trangThai}
            </span>
          </div>

          <div className="detail-progress">
            <div className="progress-label">
              <span>Tiến độ thực hiện:</span>
              <span>{checkup.daKham} / {checkup.soLuongHocSinh} học sinh ({calculateCompletionPercentage()}%)</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${calculateCompletionPercentage()}%` }}
              ></div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-item">
              <span className="detail-label">Thời gian:</span>
              <span className="detail-value">
                {formatDate(checkup.ngayBatDau)} - {formatDate(checkup.ngayKetThuc)}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Đối tượng:</span>
              <span className="detail-value">{checkup.doiTuong}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Người phụ trách:</span>
              <span className="detail-value">{checkup.nguoiPhuTrach}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Ghi chú:</span>
              <div className="detail-note">{checkup.ghiChu || 'Không có ghi chú'}</div>
            </div>
          </div>

          {/* This section can be expanded with related content like student lists, results, etc. */}
          <div className="detail-section">
            <h4>Thông tin bổ sung</h4>
            <p className="detail-info">
              Để xem danh sách chi tiết học sinh và kết quả kiểm tra, vui lòng truy cập vào báo cáo chi tiết 
              hoặc hệ thống quản lý học sinh.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button className="btn-primary" onClick={onEdit}>
            <i className="fas fa-edit"></i> Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckupDetailModal;
