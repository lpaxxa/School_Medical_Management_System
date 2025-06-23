import React from 'react';
import './MedicationHistoryDetail.css';

const MedicationHistoryDetail = ({ medication, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="medication-history-detail">
      <div className="detail-header">
        <h3>Chi tiết sử dụng thuốc</h3>
        <button className="btn-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h4>Thông tin cơ bản</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value">{medication.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái:</span>
              <span className={`status-value ${medication.status === 'completed' ? 'completed' : 'scheduled'}`}>
                {medication.status === 'completed' ? 'Đã thực hiện' : 'Lịch dùng thuốc'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Thời gian dùng thuốc:</span>
              <span className="info-value">{formatDate(medication.administrationTime)}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h4>Thông tin học sinh</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Mã học sinh:</span>
              <span className="info-value">{medication.studentId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tên học sinh:</span>
              <span className="info-value">{medication.studentName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Lớp:</span>
              <span className="info-value">{medication.class}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h4>Thông tin thuốc</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Tên thuốc:</span>
              <span className="info-value">{medication.medicineName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Liều lượng:</span>
              <span className="info-value">{medication.dosage}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h4>Thông tin thực hiện</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Người thực hiện:</span>
              <span className="info-value">{medication.administeredBy || 'Chưa có thông tin'}</span>
            </div>
          </div>

          {medication.notes && (
            <div className="info-block">
              <span className="info-label">Ghi chú:</span>
              <p className="info-text">{medication.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="detail-actions">
        <button className="btn-back" onClick={onClose}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        {medication.status === 'scheduled' && (
          <button className="btn-complete">
            <i className="fas fa-check"></i> Đánh dấu đã thực hiện
          </button>
        )}
        <button className="btn-print">
          <i className="fas fa-print"></i> In thông tin
        </button>
      </div>
    </div>
  );
};

export default MedicationHistoryDetail;
