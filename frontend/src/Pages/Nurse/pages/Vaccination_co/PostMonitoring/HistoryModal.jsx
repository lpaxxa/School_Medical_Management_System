import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import './HistoryModalNew.css';

const HistoryModal = () => {
  const {
    showHistoryModal,
    historyLoading,
    selectedStudentHistory,
    handleShowUpdateNoteModal,
    handleCloseHistoryModalOnly,
  } = useVaccination();

  const { history, studentInfo } = selectedStudentHistory;

  // Helper function to determine monitoring status
  const getMonitoringStatus = (notes) => {
    if (!notes || notes.trim() === '') {
      return { status: 'Chưa hoàn thành', className: 'status-incomplete' };
    }

    const lowerNotes = notes.toLowerCase();
    if (lowerNotes.includes('không có phản ứng') ||
        lowerNotes.includes('bình thường') ||
        lowerNotes.includes('hoàn thành')) {
      return { status: 'Hoàn thành', className: 'status-complete' };
    }

    return { status: 'Cần theo dõi', className: 'status-monitoring' };
  };

  // Add/remove body class when modal opens/closes
  useEffect(() => {
    if (showHistoryModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showHistoryModal]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showHistoryModal) {
        handleCloseHistoryModalOnly();
      }
    };

    if (showHistoryModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showHistoryModal, handleCloseHistoryModalOnly]);

  if (!selectedStudentHistory || !selectedStudentHistory.studentInfo || !showHistoryModal) {
    return null;
  }

  // Render modal using portal to ensure it's rendered at the root level
  return createPortal(
    <div className="history-modal-overlay" onClick={handleCloseHistoryModalOnly}>
      <div className="history-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="history-modal-header">
          <div className="modal-title">
            <span className="title-icon">📋</span>
            <h2 style={{color: 'white'}}>Lịch sử tiêm chủng</h2>
          </div>
          <button
            className="close-button"
            onClick={handleCloseHistoryModalOnly}
            aria-label="Đóng modal"
          >
            ✕
          </button>
        </div>
        {/* Modal Body */}
        <div className="history-modal-body">
          {/* Student Information Card */}
          <div className="student-info-card">
            <div className="student-info-header">
              <span className="info-icon">👤</span>
              <h3>Thông tin học sinh</h3>
            </div>
            <div className="student-info-grid">
              <div className="info-item">
                <span className="info-label">Tên học sinh:</span>
                <span className="info-value">{studentInfo?.studentName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Lớp:</span>
                <span className="info-value">{studentInfo?.className || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày tiêm:</span>
                <span className="info-value">
                  {selectedStudentHistory.vaccinationDate ?
                    new Date(selectedStudentHistory.vaccinationDate).toLocaleDateString('vi-VN') :
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Vaccination History Section */}
          <div className="vaccination-history-section">
            <div className="section-header">
              <span className="section-icon">💉</span>
              <h3>Lịch sử tiêm chủng</h3>
            </div>

            {historyLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải lịch sử tiêm chủng...</p>
              </div>
            ) : history && history.length > 0 ? (
              <div className="vaccination-records">
                {history.map((record, index) => (
                  <div key={record.id || index} className="vaccination-record">
                    {/* Record Header */}
                    <div className="record-header">
                      <div className="record-title">
                        <span className="dose-icon">💉</span>
                        <h4 style={{color: 'white'}}>Lần tiêm {record.doseNumber}</h4>
                      </div>
                      <div className="record-status">
                        <span className="record-number">#{index + 1}</span>
                        <span className={`status-badge ${getMonitoringStatus(record.notes).className}`}>
                          <span className="status-icon">
                            {getMonitoringStatus(record.notes).status === 'Hoàn thành' ? '✅' : '⚠️'}
                          </span>
                          {getMonitoringStatus(record.notes).status}
                        </span>
                      </div>
                    </div>

                    {/* Record Content */}
                    <div className="record-content">
                      <div className="record-field">
                        <label className="field-label">
                          <span className="field-icon">💊</span>
                          Tên vaccine:
                        </label>
                        <div className="field-value">{record.vaccineName}</div>
                      </div>

                      <div className="record-field">
                        <label className="field-label">
                          <span className="field-icon">📝</span>
                          Ghi chú theo dõi:
                        </label>
                        <div className="field-value note-field">
                          {record.notes || '⚠️ Chưa có ghi chú theo dõi'}
                        </div>
                      </div>
                    </div>

                    {/* Record Footer */}
                    <div className="record-footer">
                      <button
                        className="update-note-button"
                        onClick={() => handleShowUpdateNoteModal({
                          ...record,
                          id: record.id || `${studentInfo?.studentId}_${record.vaccineName}_${record.doseNumber}`,
                          studentName: studentInfo?.studentName
                        })}
                      >
                        <span className="button-icon">✏️</span>
                        Cập nhật ghi chú theo dõi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-records">
                <div className="no-records-icon">📋</div>
                <h4>Không có dữ liệu lịch sử tiêm chủng</h4>
                <p>Học sinh chưa được tiêm chủng hoặc chưa có dữ liệu ghi nhận trong ngày này</p>
              </div>
            )}
          </div>
        </div>
        {/* Modal Footer */}
        <div className="history-modal-footer">
          <button
            className="back-button"
            onClick={handleCloseHistoryModalOnly}
          >
            <span className="button-icon">←</span>
            Quay lại
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HistoryModal; 