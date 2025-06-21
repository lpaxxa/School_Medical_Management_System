import React, { useState } from 'react';
import './MedicineReceiptDetail.css';

const MedicineReceiptDetail = ({ receipt, onClose, onApprove, onReject, isProcessing }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getStatus = () => {
    const status = receipt.status || receipt.approvalStatus;
    return status;
  };

  const getStatusDisplay = () => {
    const status = getStatus();
    switch (status) {
      case 'PENDING_APPROVAL':
        return { text: 'Chờ duyệt', class: 'pending' };
      case 'APPROVED':
        return { text: 'Đã duyệt', class: 'approved' };
      case 'REJECTED':
        return { text: 'Từ chối', class: 'rejected' };
      // Legacy support for old mock data
      case 'PENDING':
        return { text: 'Chờ duyệt', class: 'pending' };
      default:
        return { text: 'Chờ duyệt', class: 'pending' };
    }
  };

  const handleApprove = () => {
    if (showApprovalForm) {
      onApprove(receipt.id, approvalReason);
      setShowApprovalForm(false);
      setApprovalReason('');
    } else {
      setShowApprovalForm(true);
    }
  };

  const handleReject = () => {
    if (showRejectForm) {
      if (!rejectionReason.trim()) {
        alert('Vui lòng nhập lý do từ chối');
        return;
      }
      onReject(receipt.id, rejectionReason);
      setShowRejectForm(false);
      setRejectionReason('');
    } else {
      setShowRejectForm(true);
    }
  };

  const statusDisplay = getStatusDisplay();
  const isPending = getStatus() === 'PENDING_APPROVAL' || getStatus() === 'PENDING'; // Legacy support

  return (
    <div className="medicine-receipt-detail">
      <div className="detail-header">
        <h3>Chi tiết yêu cầu thuốc</h3>
        <button className="btn-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h4>Thông tin chung</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">ID yêu cầu:</span>
              <span className="info-value">{receipt.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái:</span>
              <span className={`status-value ${statusDisplay.class}`}>
                {statusDisplay.text}
              </span>
            </div>
            {(receipt.approvedDate || receipt.receivedDate) && (
              <div className="info-item">
                <span className="info-label">
                  {getStatus() === 'APPROVED' ? 'Ngày duyệt:' : 'Ngày xử lý:'}
                </span>
                <span className="info-value">
                  {formatDate(receipt.approvedDate || receipt.receivedDate)}
                </span>
              </div>
            )}
          </div>
          
          {receipt.approvalReason && (
            <div className="info-block">
              <span className="info-label">Ghi chú duyệt:</span>
              <p className="info-text">{receipt.approvalReason}</p>
            </div>
          )}
          
          {receipt.rejectionReason && (
            <div className="info-block">
              <span className="info-label">Lý do từ chối:</span>
              <p className="info-text rejection-reason">{receipt.rejectionReason}</p>
            </div>
          )}
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
            <h4>Ghi chú từ phụ huynh</h4>
            <p className="info-text">{receipt.notes}</p>
          </div>
        )}

        {/* Approval form */}
        {showApprovalForm && isPending && (
          <div className="detail-section approval-form">
            <h4>Duyệt yêu cầu</h4>
            <div className="form-group">
              <label htmlFor="approval-reason">Ghi chú duyệt (tùy chọn):</label>
              <textarea
                id="approval-reason"
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder="Nhập ghi chú cho việc duyệt yêu cầu này..."
                rows="3"
              />
            </div>
          </div>
        )}

        {/* Rejection form */}
        {showRejectForm && isPending && (
          <div className="detail-section rejection-form">
            <h4>Từ chối yêu cầu</h4>
            <div className="form-group">
              <label htmlFor="rejection-reason">Lý do từ chối <span className="required">*</span>:</label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối yêu cầu này..."
                rows="3"
                required
              />
            </div>
          </div>
        )}
      </div>

      <div className="detail-actions">
        {isPending && !isProcessing && (
          <>
            {!showApprovalForm && !showRejectForm && (
              <>
                <button 
                  className="btn-approve"
                  onClick={handleApprove}
                >
                  <i className="fas fa-check"></i> Duyệt yêu cầu
                </button>
                <button 
                  className="btn-reject"
                  onClick={handleReject}
                >
                  <i className="fas fa-times"></i> Từ chối yêu cầu
                </button>
              </>
            )}
            
            {showApprovalForm && (
              <>
                <button 
                  className="btn-confirm-approve"
                  onClick={handleApprove}
                >
                  <i className="fas fa-check"></i> Xác nhận duyệt
                </button>
                <button 
                  className="btn-cancel-action"
                  onClick={() => {
                    setShowApprovalForm(false);
                    setApprovalReason('');
                  }}
                >
                  <i className="fas fa-undo"></i> Hủy
                </button>
              </>
            )}
            
            {showRejectForm && (
              <>
                <button 
                  className="btn-confirm-reject"
                  onClick={handleReject}
                >
                  <i className="fas fa-times"></i> Xác nhận từ chối
                </button>
                <button 
                  className="btn-cancel-action"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                >
                  <i className="fas fa-undo"></i> Hủy
                </button>
              </>
            )}
          </>
        )}
        
        {isProcessing && (
          <div className="processing-indicator">
            <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
          </div>
        )}
        
        <button className="btn-back" onClick={onClose}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>
    </div>
  );
};

export default MedicineReceiptDetail;
