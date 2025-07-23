import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import Swal from 'sweetalert2';

const UpdateNoteModal = () => {
  const {
    showUpdateNoteModal,
    handleCloseUpdateNoteModal,
    recordToUpdate,
    handleUpdateNote,
  } = useVaccination();

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (recordToUpdate) {
      setNotes(recordToUpdate.notes || '');
    }
  }, [recordToUpdate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await handleUpdateNote(notes);

      // Delay để đồng bộ với việc đóng modal trong context
      setTimeout(() => {
        // Show success notification with SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật ghi chú theo dõi thành công!',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#015C92',
          allowOutsideClick: false, // Tắt click outside để đóng
          allowEscapeKey: false, // Tắt ESC key để đóng
          customClass: {
            container: 'swal-high-z-index' // Custom class để tăng z-index
          },
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
      }, 300); // Tăng delay để đảm bảo modal đã đóng hoàn toàn
    } catch (error) {
      // Delay để đồng bộ với việc đóng modal trong context
      setTimeout(() => {
        // Show error notification
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể cập nhật ghi chú. Vui lòng thử lại.',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#dc3545',
          allowOutsideClick: false, // Tắt click outside để đóng
          allowEscapeKey: false, // Tắt ESC key để đóng
          customClass: {
            container: 'swal-high-z-index' // Custom class để tăng z-index
          }
        });
      }, 300); // Tăng delay để đảm bảo modal đã đóng hoàn toàn
    }
  };

  if (!showUpdateNoteModal) {
    return null;
  }

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
      onClick={handleCloseUpdateNoteModal}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
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
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'white' }}>
            Cập nhật ghi chú sau tiêm
          </h2>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onClick={handleCloseUpdateNoteModal}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div
            style={{
              padding: '32px',
              flex: 1,
              overflowY: 'auto'
            }}
          >
            {/* Student Information Section */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginRight: '8px'
                }}>
                  Học sinh:
                </span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {recordToUpdate?.studentName || 'N/A'}
                </span>
              </div>
              <div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginRight: '8px'
                }}>
                  ID hồ sơ tiêm:
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  fontFamily: 'monospace'
                }}>
                  {recordToUpdate?.id}
                </span>
              </div>
            </div>

            {/* Notes Form Group */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '8px'
                }}
              >
                Ghi chú theo dõi sau tiêm
              </label>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú chi tiết về tình trạng sức khỏe và phản ứng của học sinh sau khi tiêm vaccine..."
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: '120px',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#015C92'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '20px 32px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}
          >
            <button
              type="button"
              onClick={handleCloseUpdateNoteModal}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#015C92',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#014a7a'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#015C92'}
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
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

          .swal-high-z-index {
            z-index: 10000 !important;
          }

          .swal-high-z-index .swal2-container {
            z-index: 10000 !important;
          }
        `}
      </style>
    </div>,
    document.body
  );
};

export default UpdateNoteModal; 