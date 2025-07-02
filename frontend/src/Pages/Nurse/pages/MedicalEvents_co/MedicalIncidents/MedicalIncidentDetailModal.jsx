
import React from 'react';

const MedicalIncidentDetailModal = ({ 
  show, 
  onClose, 
  selectedEvent,
  showImageModal,
  selectedImageUrl,
  setSelectedImageUrl,
  setShowImageModal
}) => {
  if (!selectedEvent) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityBadge = (severity) => {
    const severityMap = {
      'Nhẹ': 'success',
      'Light': 'success',
      'Low': 'success',
      'Mild': 'success',
      'Trung bình': 'warning',
      'Medium': 'warning',
      'Moderate': 'warning', 
      'Nặng': 'danger',
      'Nghiêm trọng': 'danger',
      'High': 'danger',
      'Heavy': 'danger',
      'Severe': 'danger'
    };
    return `badge bg-${severityMap[severity] || 'secondary'}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'warning',
      'In Progress': 'info',
      'Resolved': 'success',
      'Closed': 'secondary'
    };
    return `badge bg-${statusMap[status] || 'secondary'}`;
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-notes-medical me-2"></i>
                Chi tiết Sự kiện Y tế
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="card">
                <div className="card-body">
                  {/* Thông tin cơ bản */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h6 className="text-primary fw-bold mb-2">
                        <i className="fas fa-tag me-2"></i>Loại sự kiện
                      </h6>
                      <p className="fw-bold text-dark">{selectedEvent.incidentType}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary fw-bold mb-2">
                        <i className="fas fa-user-graduate me-2"></i>Tên học sinh
                      </h6>
                      <p className="fw-bold text-dark">{selectedEvent.studentName}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h6 className="text-primary fw-bold mb-2">
                        <i className="fas fa-calendar-alt me-2"></i>Ngày giờ xảy ra
                      </h6>
                      <p className="text-dark">{formatDate(selectedEvent.dateTime)}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary fw-bold mb-2">
                        <i className="fas fa-id-card me-2"></i>Mã học sinh
                      </h6>
                      <p className="text-dark"><code className="bg-light p-1 rounded">{selectedEvent.studentId}</code></p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h6 className="text-danger fw-bold mb-2">
                        <i className="fas fa-exclamation-triangle me-2"></i>Mức độ nghiêm trọng
                      </h6>
                      <span className={getSeverityBadge(selectedEvent.severityLevel)}>
                        {selectedEvent.severityLevel}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary fw-bold mb-2">
                        <i className="fas fa-user-md me-2"></i>Nhân viên phụ trách
                      </h6>
                      <p className="text-dark">{selectedEvent.staffName}</p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Mô tả */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <h6 className="text-info fw-bold mb-2">
                        <i className="fas fa-file-alt me-2"></i>Mô tả chi tiết
                      </h6>
                      <p className="border p-3 rounded bg-light text-dark">
                        {selectedEvent.description || 'Không có mô tả'}
                      </p>
                    </div>
                  </div>

                  {/* Triệu chứng */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <h6 className="text-warning fw-bold mb-2">
                        <i className="fas fa-heartbeat me-2"></i>Triệu chứng
                      </h6>
                      <p className="border p-3 rounded bg-light text-dark">
                        {selectedEvent.symptoms || 'Không có triệu chứng'}
                      </p>
                    </div>
                  </div>

                  {/* Điều trị */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <h6 className="text-success fw-bold mb-2">
                        <i className="fas fa-stethoscope me-2"></i>Điều trị
                      </h6>
                      <p className="border p-3 rounded bg-light text-dark">
                        {selectedEvent.treatment || 'Chưa có điều trị'}
                      </p>
                    </div>
                  </div>

                  {/* Thuốc sử dụng */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <h6 className="text-secondary fw-bold mb-2">
                        <i className="fas fa-pills me-2"></i>Thuốc đã sử dụng
                      </h6>
                      <p className="border p-3 rounded bg-light text-dark">
                        {selectedEvent.medicationsUsed || 'Không có thông tin thuốc'}
                      </p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Thông báo phụ huynh */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h6 className="text-warning fw-bold mb-2">
                        <i className="fas fa-bell me-2"></i>Đã thông báo phụ huynh
                      </h6>
                      <span className={`badge ${selectedEvent.parentNotified ? 'bg-success' : 'bg-danger'}`}>
                        <i className={`fas ${selectedEvent.parentNotified ? 'fa-check' : 'fa-times'} me-1`}></i>
                        {selectedEvent.parentNotified ? 'Đã thông báo' : 'Chưa thông báo'}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-info fw-bold mb-2">
                        <i className="fas fa-eye me-2"></i>Cần theo dõi
                      </h6>
                      <span className={`badge ${selectedEvent.requiresFollowUp ? 'bg-warning' : 'bg-success'}`}>
                        <i className={`fas ${selectedEvent.requiresFollowUp ? 'fa-eye' : 'fa-check-circle'} me-1`}></i>
                        {selectedEvent.requiresFollowUp ? 'Cần theo dõi' : 'Không cần'}
                      </span>
                    </div>
                  </div>

                  {/* Ghi chú theo dõi */}
                  {selectedEvent.followUpNotes && (
                    <div className="row mb-3">
                      <div className="col-12">
                        <h6 className="text-purple fw-bold mb-2" style={{color: '#6f42c1'}}>
                          <i className="fas fa-sticky-note me-2"></i>Ghi chú theo dõi
                        </h6>
                        <p className="border p-3 rounded bg-light text-dark">
                          {selectedEvent.followUpNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hình ảnh */}
                  {selectedEvent.imgUrl && (
                    <div className="row mb-3">
                      <div className="col-12">
                        <h6 className="text-dark fw-bold mb-2">
                          <i className="fas fa-images me-2"></i>Hình ảnh
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          <img
                            src={selectedEvent.imgUrl}
                            alt="Medical incident"
                            className="img-thumbnail"
                            style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => {
                              if (setSelectedImageUrl && setShowImageModal) {
                                setSelectedImageUrl(selectedEvent.imgUrl);
                                setShowImageModal(true);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button 
                type="button" 
                className="btn btn-secondary btn-lg" 
                onClick={onClose}
              >
                <i className="fas fa-times me-2"></i>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImageUrl && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xem ảnh</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowImageModal && setShowImageModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center">
                <img 
                  src={selectedImageUrl} 
                  alt="Medical incident" 
                  className="img-fluid"
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalIncidentDetailModal;
