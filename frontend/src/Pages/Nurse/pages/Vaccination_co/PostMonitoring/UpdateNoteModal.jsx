import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateNote(notes);
  };

  return (
    <Modal show={showUpdateNoteModal} onHide={handleCloseUpdateNoteModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật ghi chú sau tiêm</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p>
            <strong>Học sinh:</strong> {recordToUpdate?.studentName || 'N/A'}
          </p>
          <p>
            <strong>ID hồ sơ tiêm:</strong>{' '}
            <span className="fw-bold">{recordToUpdate?.id}</span>
          </p>
          <Form.Group controlId="vaccinationNotes">
            <Form.Label>Ghi chú của y tá</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú về phản ứng sau tiêm..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUpdateNoteModal}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateNoteModal; 