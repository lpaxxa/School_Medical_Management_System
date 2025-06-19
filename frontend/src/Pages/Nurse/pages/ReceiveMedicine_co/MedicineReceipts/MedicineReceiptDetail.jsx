import React from 'react';
import './MedicineReceiptDetail.css';

const MedicineReceiptDetail = ({ receipt, onClose, onConfirmReceive }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="medicine-receipt-detail">
      <div className="detail-header">
        <h3>Chi tiết đơn nhận thuốc</h3>
        <button className="btn-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h4>Thông tin chung</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">ID đơn:</span>
              <span className="info-value">{receipt.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái:</span>
              <span className={`status-value ${receipt.status === 'pending' ? 'pending' : 'received'}`}>
                {receipt.status === 'pending' ? 'Chờ xác nhận' : 'Đã nhận'}
              </span>
            </div>
            {receipt.status === 'received' && (
              <div className="info-item">
                <span className="info-label">Ngày nhận:</span>
                <span className="info-value">{formatDate(receipt.receivedDate)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h4>Thông tin học sinh</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Mã học sinh:</span>
              <span className="info-value">{receipt.studentId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tên học sinh:</span>
              <span className="info-value">{receipt.studentName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Lớp:</span>
              <span className="info-value">{receipt.class}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phụ huynh:</span>
              <span className="info-value">{receipt.parentName}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h4>Thông tin thuốc</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Tên thuốc:</span>
              <span className="info-value">{receipt.medicineName}</span>
            </div>
            {receipt.medicineId && (
              <div className="info-item">
                <span className="info-label">ID thuốc:</span>
                <span className="info-value">{receipt.medicineId}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Số lượng:</span>
              <span className="info-value">{receipt.quantity}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tần suất sử dụng:</span>
              <span className="info-value">{receipt.frequency}</span>
            </div>
          </div>

          <div className="info-block">
            <span className="info-label">Hướng dẫn sử dụng:</span>
            <p className="info-text">{receipt.instructions || 'Không có'}</p>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Ngày bắt đầu:</span>
              <span className="info-value">{formatDate(receipt.startDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ngày kết thúc:</span>
              <span className="info-value">{formatDate(receipt.endDate)}</span>
            </div>
          </div>
        </div>

        {receipt.notes && (
          <div className="detail-section">
            <h4>Ghi chú</h4>
            <p className="info-text">{receipt.notes}</p>
          </div>
        )}
      </div>

      <div className="detail-actions">
        {receipt.status === 'pending' && (
          <button 
            className="btn-confirm"
            onClick={() => {
              onConfirmReceive(receipt.id);
              onClose();
            }}
          >
            <i className="fas fa-check"></i> Xác nhận đã nhận thuốc
          </button>
        )}
        <button className="btn-back" onClick={onClose}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>
    </div>
  );
};

export default MedicineReceiptDetail;
