import React, { useEffect, useRef } from 'react';
import './MedicineReceiptDetail.css';

const MedicineReceiptDetail = ({ receipt, onClose, onConfirmReceive }) => {
  const modalRef = useRef(null);
  
  // Thêm hiệu ứng đóng modal khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    // Tạo event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Thêm class vào body để ngăn cuộn trang
    document.body.style.overflow = 'hidden';
    
    // Cleanup event listener khi unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  // Xử lý đóng modal khi nhấn ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);
  
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
    <div className="medicine-receipt-detail-overlay">
      <div className="medicine-receipt-detail" ref={modalRef}>
        <div className="detail-header">
          <h3>Chi tiết đơn nhận thuốc</h3>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

      <div className="detail-content">        <div className="detail-section">
          <h4>Thông tin chung</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">ID đơn:</span>
              <span className="info-value">{receipt.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ngày gửi:</span>
              <span className="info-value">{formatDate(receipt.submittedAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái:</span>
              <span className={`status-value ${
                receipt.status === 'PENDING_APPROVAL' ? 'pending' : 
                receipt.status === 'APPROVED' ? 'approved' : 
                receipt.status === 'REJECTED' ? 'rejected' : 
                'cancelled'
              }`}>
                {receipt.status === 'PENDING_APPROVAL' ? 'Chờ phê duyệt' : 
                 receipt.status === 'APPROVED' ? 'Đã phê duyệt' : 
                 receipt.status === 'REJECTED' ? 'Đã từ chối' : 
                 'Đã hủy'}
              </span>
            </div>
            {receipt.responseDate && (
              <div className="info-item">
                <span className="info-label">Ngày phản hồi:</span>
                <span className="info-value">{formatDate(receipt.responseDate)}</span>
              </div>
            )}
            {receipt.approvedBy && (
              <div className="info-item">
                <span className="info-label">Người phê duyệt:</span>
                <span className="info-value">{receipt.approvedBy}</span>
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
              <span className="info-value">{receipt.studentClass}</span>
            </div>
            <div className="info-item">
              <span className="info-label">ID hồ sơ sức khỏe:</span>
              <span className="info-value">{receipt.healthProfileId}</span>
            </div>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Phụ huynh:</span>
              <span className="info-value">{receipt.requestedBy}</span>
            </div>
            <div className="info-item">
              <span className="info-label">ID phụ huynh:</span>
              <span className="info-value">{receipt.requestedByAccountId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phụ huynh cung cấp thuốc:</span>
              <span className="info-value">{receipt.parentProvided ? 'Có' : 'Không'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h4>Thông tin thuốc</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Tên thuốc:</span>
              <span className="info-value">{receipt.medicationName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Số lần dùng mỗi ngày:</span>
              <span className="info-value">{receipt.frequencyPerDay}</span>
            </div>
          </div>

          <div className="info-block">
            <span className="info-label">Hướng dẫn liều lượng:</span>
            <p className="info-text">{receipt.dosageInstructions || 'Không có'}</p>
          </div>

          <div className="info-block">
            <span className="info-label">Thời gian dùng thuốc:</span>
            <p className="info-text">{receipt.timeOfDay || 'Không có'}</p>
          </div>

          <div className="info-block">
            <span className="info-label">Hướng dẫn đặc biệt:</span>
            <p className="info-text">{receipt.specialInstructions || 'Không có'}</p>
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
        </div>        {receipt.rejectionReason && (
          <div className="detail-section">
            <h4>Lý do từ chối</h4>
            <p className="info-text rejection-reason">{receipt.rejectionReason}</p>
          </div>
        )}
      </div>      <div className="detail-actions">
        {receipt.status === 'PENDING_APPROVAL' && (
          <button 
            className="btn-confirm"
            onClick={() => {
              onConfirmReceive(receipt.id);
              onClose();
            }}
          >
            <i className="fas fa-check"></i> Phê duyệt yêu cầu thuốc
          </button>
        )}<button className="btn-back" onClick={onClose}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>
    </div>
    </div>
  );
};

export default MedicineReceiptDetail;
