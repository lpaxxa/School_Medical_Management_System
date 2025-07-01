import React from 'react';
import './MedicalIncidentDetailModal.css';

const MedicalIncidentDetailModal = ({ 
  show, 
  selectedEvent, 
  onClose, 
  onEdit,
  showImageModal,
  setShowImageModal,
  selectedImageUrl,
  setSelectedImageUrl 
}) => {
  
  // Format date time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Không có thông tin";
    
    try {
      const dateObj = new Date(dateTimeString);
      return dateObj.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Lỗi khi định dạng ngày tháng:", error);
      return dateTimeString;
    }
  };

  // Hàm lấy class cho Badge dựa trên mức độ nghiêm trọng
  const getSeverityBadgeClass = (severity) => {
    if (!severity) return "bg-secondary";
    
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('nhẹ') || severityLower === 'mild') {
      return "bg-success";
    } else if (severityLower.includes('trung bình') || severityLower === 'moderate') {
      return "bg-warning text-dark";
    } else if (severityLower.includes('nghiêm trọng') || severityLower === 'severe') {
      return "bg-danger";
    }
    
    return "bg-secondary";
  };

  if (!show || !selectedEvent) return null;

  return (
    <>
      {/* Modal xem chi tiết */}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container view-details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Chi tiết sự kiện y tế</h3>
            <button 
              className="close-btn" 
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body">
            <div className="detail-sections">
              {/* Thông tin cơ bản */}
              <div className="detail-section">
                <h4 className="detail-section-title">Thông tin cơ bản</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">ID sự kiện:</span>
                    <span className="detail-value">{selectedEvent.incidentId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Loại sự kiện:</span>
                    <span className="detail-value">{selectedEvent.incidentType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày giờ:</span>
                    <span className="detail-value">{formatDateTime(selectedEvent.dateTime)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mức độ:</span>
                    <span className={`detail-value badge ${getSeverityBadgeClass(selectedEvent.severityLevel)}`}>
                      {selectedEvent.severityLevel}
                    </span>
                  </div>
                </div>
              </div>
                
              {/* Thông tin học sinh */}
              <div className="detail-section">
                <h4 className="detail-section-title">Thông tin học sinh</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Mã học sinh:</span>
                    <span className="detail-value">{selectedEvent.studentId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tên học sinh:</span>
                    <span className="detail-value">{selectedEvent.studentName}</span>
                  </div>
                </div>
              </div>
              
              {/* Triệu chứng và điều trị */}
              <div className="detail-section">
                <h4 className="detail-section-title">Triệu chứng và điều trị</h4>
                <div className="detail-row">
                  <span className="detail-label">Mô tả:</span>
                  <span className="detail-value">{selectedEvent.description || "Không có mô tả"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Triệu chứng:</span>
                  <span className="detail-value">{selectedEvent.symptoms || "Không ghi nhận triệu chứng"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Điều trị:</span>
                  <span className="detail-value">{selectedEvent.treatment || "Không có thông tin điều trị"}</span>
                </div>
              </div>
              
              {/* Thuốc đã sử dụng */}
              <div className="detail-section">
                <h4 className="detail-section-title">Thuốc đã sử dụng</h4>
                <div className="medications-list">
                  {selectedEvent.medicationsUsed ? (
                    <div className="medication-item">
                      <div className="medication-detail">
                        <i className="fas fa-pills me-2"></i>
                        {typeof selectedEvent.medicationsUsed === 'string' 
                          ? selectedEvent.medicationsUsed 
                          : Array.isArray(selectedEvent.medicationsUsed)
                            ? selectedEvent.medicationsUsed.map((med, index) => (
                                <div key={index} className="medication-entry">
                                  {typeof med === 'object' ? `${med.name || 'Thuốc'} (${med.quantity || 'N/A'})` : med}
                                </div>
                              ))
                            : JSON.stringify(selectedEvent.medicationsUsed)
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="medication-item">
                      <div className="no-medications">
                        <i className="fas fa-info-circle me-2"></i>
                        Không có thông tin về thuốc đã sử dụng
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Theo dõi và thông báo */}
              <div className="detail-section">
                <h4 className="detail-section-title">Theo dõi và thông báo</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Thông báo phụ huynh:</span>
                    <span className="detail-value status-indicator">
                      {selectedEvent.parentNotified ? (
                        <><i className="fas fa-check-circle status-icon notified"></i> Đã thông báo</>
                      ) : (
                        <><i className="fas fa-question-circle status-icon not-notified"></i> Chưa thông báo</>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Cần theo dõi tiếp:</span>
                    <span className="detail-value status-indicator">
                      {selectedEvent.requiresFollowUp ? (
                        <><i className="fas fa-eye status-icon follow-up"></i> Cần theo dõi</>
                      ) : (
                        <><i className="fas fa-check-circle status-icon no-follow-up"></i> Không cần theo dõi</>
                      )}
                    </span>
                  </div>
                </div>
                {selectedEvent.followUpNotes && (
                  <div className="detail-row">
                    <span className="detail-label">Ghi chú theo dõi:</span>
                    <span className="detail-value">{selectedEvent.followUpNotes}</span>
                  </div>
                )}
              </div>
              
              {/* Thông tin nhân viên */}
              <div className="detail-section">
                <h4 className="detail-section-title">Thông tin nhân viên</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">ID nhân viên:</span>
                    <span className="detail-value">{selectedEvent.staffId || "Không có thông tin"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tên nhân viên:</span>
                    <span className="detail-value">{selectedEvent.staffName || "Không có thông tin"}</span>
                  </div>
                </div>
              </div>
              
              {/* Hình ảnh */}
              {selectedEvent.imgUrl && (
                <div className="detail-section">
                  <h4 className="detail-section-title">Hình ảnh</h4>
                  <div className="image-container">
                    <img 
                      src={selectedEvent.imgUrl}
                      alt="Hình ảnh sự cố y tế" 
                      className="incident-image clickable"
                      onClick={() => {
                        setSelectedImageUrl(selectedEvent.imgUrl);
                        setShowImageModal(true);
                      }}
                      title="Nhấn để xem ảnh đầy đủ"
                    />
                    <div className="image-caption">
                      <i className="fas fa-search-plus"></i> Nhấn vào hình để xem kích thước đầy đủ
                    </div>
                  </div>
                </div>
              )}
              
              {/* Thông tin bổ sung */}
              <div className="detail-section">
                <h4 className="detail-section-title">Thông tin bổ sung</h4>
                <div className="detail-row">
                  <span className="detail-label">ID Phụ huynh:</span>
                  <span className="detail-value">{selectedEvent.parentID || "Không có thông tin"}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              <i className="fas fa-times"></i> Đóng
            </button>
            <button className="btn btn-primary" onClick={() => {
              onClose();
              setTimeout(() => onEdit(selectedEvent.incidentId), 300);
            }}>
              <i className="fas fa-edit"></i> Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      {/* Modal xem hình ảnh đầy đủ */}
      {showImageModal && selectedImageUrl && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hình ảnh chi tiết</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowImageModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="image-modal-body">
              <img 
                src={selectedImageUrl} 
                alt="Hình ảnh chi tiết sự cố y tế" 
                className="full-size-image"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImageModal(false)}>
                <i className="fas fa-times"></i> Đóng
              </button>
              <a 
                href={selectedImageUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                <i className="fas fa-external-link-alt"></i> Mở trong tab mới
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalIncidentDetailModal;
