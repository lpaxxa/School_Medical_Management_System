import React from 'react';

const MedicalIncidentDetailModal = ({ 
  show, 
  onClose, 
  selectedEvent
}) => {
  if (!selectedEvent) return null;

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    let date;

    // Handle array format from backend [year, month, day]
    if (Array.isArray(dateInput)) {
      if (dateInput.length >= 3) {
        // Month is 0-indexed in JavaScript Date constructor
        date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2]);
      } else {
        return 'N/A';
      }
    }
    // Handle string format
    else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    }
    // Handle Date object
    else if (dateInput instanceof Date) {
      date = dateInput;
    }
    else {
      return 'N/A';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('vi-VN', {
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
      'Trung bình': 'warning',
      'Nghiêm trọng': 'danger',
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
            <div className="modal-header bg-gradient bg-primary text-white border-0">
              <h5 className="modal-title fw-bold d-flex align-items-center" style={{color: 'white'}}>
                <i className="fas fa-notes-medical me-2" style={{color: 'white'}}></i>
                Chi tiết Sự kiện Y tế
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white opacity-75" 
                onClick={onClose}
                aria-label="Close"
                style={{
                  filter: 'brightness(0) invert(1)',
                  fontSize: '1.2rem',
                  padding: '0.5rem'
                }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="card">
                <div className="card-body">
                  {/* Ảnh sự cố y tế - Hiển thị giữa màn hình */}
                  {(selectedEvent.imageMedicalUrl || selectedEvent.imgUrl || selectedEvent.imageUrl) && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="text-info fw-bold mb-3 text-center">
                          <i className="fas fa-image me-2"></i>Hình ảnh sự cố
                        </h6>
                        <div className="d-flex justify-content-center align-items-center">
                          <div className="position-relative">
                            <img
                              src={selectedEvent.imageMedicalUrl || selectedEvent.imgUrl || selectedEvent.imageUrl}
                              alt="Hình ảnh sự cố y tế"
                              className="img-fluid rounded shadow-lg border border-2 border-primary"
                              style={{ 
                                maxWidth: '100%',
                                maxHeight: '450px',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block',
                                margin: '0 auto'
                              }}
                              onError={(e) => {
                                console.error('Lỗi tải ảnh sự cố:', selectedEvent.imageMedicalUrl || selectedEvent.imgUrl || selectedEvent.imageUrl);
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `
                                  <div class="alert alert-warning text-center mx-auto" style="max-width: 400px;">
                                    <i class="fas fa-exclamation-triangle fs-2 text-warning mb-2"></i>
                                    <h6>Không thể tải ảnh sự cố</h6>
                                    <small class="text-muted">URL: ${selectedEvent.imageMedicalUrl || selectedEvent.imgUrl || selectedEvent.imageUrl}</small>
                                  </div>
                                `;
                              }}
                              onLoad={() => {
                                console.log('Ảnh sự cố tải thành công:', selectedEvent.imageMedicalUrl || selectedEvent.imgUrl || selectedEvent.imageUrl);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hiển thị thông báo nếu không có ảnh */}
                  {!(selectedEvent.imageMedicalUrl || selectedEvent.imgUrl || selectedEvent.imageUrl) && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="alert alert-info text-center mx-auto shadow-sm" style={{maxWidth: '400px'}}>
                          <i className="fas fa-image fs-2 text-info mb-2"></i>
                          <h6 className="mb-0">Không có ảnh sự cố y tế</h6>
                        </div>
                      </div>
                    </div>
                  )}

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
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light border-0 d-flex justify-content-center py-3">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-lg px-4 py-2 d-flex align-items-center shadow-sm" 
                onClick={onClose}
                style={{
                  borderRadius: '25px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: '2px solid #6c757d'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '';
                  e.target.style.color = '';
                  e.target.style.transform = '';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <i className="fas fa-times me-2"></i>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicalIncidentDetailModal;
