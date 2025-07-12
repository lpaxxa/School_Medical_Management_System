import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import './HistoryModal.css';

const HistoryModal = () => {
  const {
    showHistoryModal,
    historyLoading,
    selectedStudentHistory,
    handleShowUpdateNoteModal,
    handleCloseHistoryModalOnly,
  } = useVaccination();

  const { student, history, studentInfo } = selectedStudentHistory;

  // Helper function to determine monitoring status
  const getMonitoringStatus = (notes) => {
    if (!notes || notes.trim() === '') {
      return { status: 'Cần theo dõi', className: 'status-pending' };
    }
    
    const normalizedNotes = notes.toLowerCase().trim();
    if (normalizedNotes.includes('không có phản ứng phụ')) {
      return { status: 'Hoàn thành', className: 'status-completed' };
    }
    
    return { status: 'Cần theo dõi', className: 'status-pending' };
  };

  // Overall monitoring status for the student
  const getOverallStatus = () => {
    if (!history || history.length === 0) {
      return { status: 'Chưa hoàn thành', className: 'status-not-started' };
    }
    
    const allCompleted = history.every(record => {
      const notes = record.notes;
      return notes && notes.toLowerCase().trim().includes('không có phản ứng phụ');
    });
    
    return allCompleted 
      ? { status: 'Hoàn thành', className: 'status-completed' }
      : { status: 'Cần theo dõi', className: 'status-pending' };
  };

  return (
    <Modal show={showHistoryModal} onHide={handleCloseHistoryModalOnly} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title style={{color: 'red'}}>Lịch sử tiêm chủng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {historyLoading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Đang tải lịch sử...</p>
          </div>
        ) : (
          <div className="vaccination-history-container">
            {/* Student Info Section */}
            {studentInfo && (
              <div className="student-details-card">
                <h3 className="student-details-title">Thông tin học sinh</h3>
                <div className="student-details-list">
                  <div className="student-detail-row">
                    <span className="detail-label">Mã học sinh:</span>
                    <span className="detail-value">{studentInfo.studentId}</span>
                  </div>
                  <div className="student-detail-row">
                    <span className="detail-label">Tên học sinh:</span>
                    <span className="detail-value">{studentInfo.studentName}</span>
                  </div>
                  <div className="student-detail-row">
                    <span className="detail-label">Lớp:</span>
                    <span className="detail-value">{studentInfo.className}</span>
                  </div>
                  <div className="student-detail-row">
                    <span className="detail-label">Trạng thái theo dõi:</span>
                    <span className={`detail-value ${getOverallStatus().className}`}>
                      {getOverallStatus().status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Vaccination History Form Cards */}
            <div className="vaccination-records-section">
              <h3 className="records-title">Lịch sử tiêm chủng</h3>
              
              {history && history.length > 0 ? (
                <div className="vaccination-cards-container">
                  {history.map((record, index) => (
                    <div key={index} className="vaccination-record-card">
                      <div className="card-header">
                        <h4 className="card-title">Lần tiêm {record.doseNumber}</h4>
                        <div className="card-header-info">
                          <span className="card-badge">#{index + 1}</span>
                          <span className={`monitoring-status ${getMonitoringStatus(record.notes).className}`}>
                            {getMonitoringStatus(record.notes).status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Tên vaccine:</label>
                            <div className="form-value">{record.vaccineName}</div>
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group full-width">
                            <label className="form-label">Ghi chú:</label>
                            <div className="form-value note-field">
                              {record.notes || 'Không có ghi chú'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-footer">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleShowUpdateNoteModal({
                            ...record,
                            id: record.id || `${studentInfo?.studentId}_${record.vaccineName}_${record.doseNumber}`,
                            studentName: studentInfo?.studentName
                          })}
                          className="update-note-btn"
                        >
                          <i className="fas fa-edit"></i> Cập nhật ghi chú
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-records-message">
                  <p>Không có dữ liệu lịch sử tiêm chủng trong ngày này.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseHistoryModalOnly}>
          Quay lại
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HistoryModal; 