import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '20px'
      }}
      onClick={handleCloseHistoryModalOnly}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)',
            color: 'white',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '16px 16px 0 0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📋</span>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' ,color: 'white'}}>Lịch sử tiêm chủng</h2>
          </div>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onClick={handleCloseHistoryModalOnly}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            aria-label="Đóng modal"
          >
            ✕
          </button>
        </div>
        {/* Modal Body */}
        <div
          style={{
            padding: '32px',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {/* Student Information Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}
            >
              <span style={{ fontSize: '20px' }}>👤</span>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                Thông tin học sinh
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}
            >
              <div>
                <span style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  Tên học sinh:
                </span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {studentInfo?.studentName || 'N/A'}
                </span>
              </div>
              <div>
                <span style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  Lớp:
                </span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {studentInfo?.className || 'N/A'}
                </span>
              </div>
              <div>
                <span style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  Ngày tiêm:
                </span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {selectedStudentHistory.vaccinationDate ?
                    new Date(selectedStudentHistory.vaccinationDate).toLocaleDateString('vi-VN') :
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Vaccination History Section */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}
            >
              <span style={{ fontSize: '20px' }}>💉</span>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                Lịch sử tiêm chủng
              </h3>
            </div>

            {historyLoading ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid #015C92',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '16px'
                  }}
                ></div>
                <p style={{ color: '#64748b', margin: 0 }}>Đang tải lịch sử tiêm chủng...</p>
              </div>
            ) : history && history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {history.map((record, index) => (
                  <div
                    key={record.id || index}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Record Header */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)',
                        color: 'white',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>💉</span>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600',color: 'white' }}>
                          Lần tiêm {record.doseNumber}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          #{index + 1}
                        </span>
                        <span
                          style={{
                            backgroundColor: getMonitoringStatus(record.notes).status === 'Hoàn thành' ? '#10b981' :
                                           getMonitoringStatus(record.notes).status === 'Cần theo dõi' ? '#f59e0b' : '#ef4444',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>
                            {getMonitoringStatus(record.notes).status === 'Hoàn thành' ? '✅' : '⚠️'}
                          </span>
                          {getMonitoringStatus(record.notes).status}
                        </span>
                      </div>
                    </div>

                    {/* Record Content */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>💊</span>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#64748b'
                          }}>
                            Tên vaccine:
                          </span>
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1e293b',
                          paddingLeft: '24px'
                        }}>
                          {record.vaccineName}
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>📝</span>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#64748b'
                          }}>
                            Ghi chú theo dõi:
                          </span>
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: record.notes ? '#1e293b' : '#ef4444',
                          backgroundColor: record.notes ? '#f8fafc' : '#fef2f2',
                          padding: '12px',
                          borderRadius: '8px',
                          border: record.notes ? '1px solid #e2e8f0' : '1px solid #fecaca',
                          paddingLeft: '24px',
                          fontStyle: record.notes ? 'normal' : 'italic'
                        }}>
                          {record.notes || '⚠️ Chưa có ghi chú theo dõi'}
                        </div>
                      </div>

                      {/* Record Footer */}
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <button
                          style={{
                            backgroundColor: '#015C92',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            width: '100%',
                            justifyContent: 'center'
                          }}
                          onClick={() => handleShowUpdateNoteModal({
                            ...record,
                            id: record.id || `${studentInfo?.studentId}_${record.vaccineName}_${record.doseNumber}`,
                            studentName: studentInfo?.studentName
                          })}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#014a7a'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#015C92'}
                        >
                          <span>✏️</span>
                          Cập nhật ghi chú theo dõi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <h4 style={{
                  margin: '0 0 8px 0',
                  color: '#1e293b',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  Không có dữ liệu lịch sử tiêm chủng
                </h4>
                <p style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: '14px'
                }}>
                  Học sinh chưa được tiêm chủng hoặc chưa có dữ liệu ghi nhận trong ngày này
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Modal Footer */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}
        >
          <button
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onClick={handleCloseHistoryModalOnly}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            <span>←</span>
            Quay lại
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>,
    document.body
  );
};

export default HistoryModal; 