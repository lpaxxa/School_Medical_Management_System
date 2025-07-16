import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import Swal from 'sweetalert2';
import './UpdateNoteModal.css';

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

      // Show success notification with SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật ghi chú theo dõi thành công!',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#015C92',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
    } catch (error) {
      // Show error notification
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể cập nhật ghi chú. Vui lòng thử lại.',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  return (
    <Modal
      show={showUpdateNoteModal}
      onHide={handleCloseUpdateNoteModal}
      centered
      className="update-note-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật ghi chú sau tiêm</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Student Information Section */}
          <div className="student-info-section">
            <div className="student-info-row">
              <span className="student-info-label">Học sinh:</span>
              <span className="student-info-value">
                {recordToUpdate?.studentName || 'N/A'}
              </span>
            </div>
            <div className="student-info-row">
              <span className="student-info-label">ID hồ sơ tiêm:</span>
              <span className="student-info-value">
                {recordToUpdate?.id}
              </span>
            </div>
          </div>

          {/* Notes Form Group */}
          <Form.Group controlId="vaccinationNotes" className="form-group-enhanced">
            <Form.Label className="form-label-enhanced">
              Ghi chú theo dõi sau tiêm
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú chi tiết về tình trạng sức khỏe và phản ứng của học sinh sau khi tiêm vaccine..."
              required
              className="form-control-enhanced"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseUpdateNoteModal}
            className="btn-cancel-enhanced"
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="btn-save-enhanced"
          >
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateNoteModal; 