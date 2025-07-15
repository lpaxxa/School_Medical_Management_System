import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const SuccessModal = ({ show, onClose, title = "Thành công!", message = "Thao tác đã được thực hiện thành công.", autoClose = true, autoCloseDelay = 3000 }) => {
  
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, autoCloseDelay, onClose]);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <i className="fas fa-check-circle me-2"></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
          <h5>{message}</h5>
          {autoClose && (
            <p className="text-muted mt-3">
              <small>
                <i className="fas fa-clock me-1"></i>
                Modal sẽ tự động đóng sau {autoCloseDelay / 1000} giây
              </small>
            </p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onClose}>
          <i className="fas fa-check me-2"></i>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuccessModal;
