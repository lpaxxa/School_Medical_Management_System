import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './MedicineNotification.css';

const MedicineNotification = ({ 
  show, 
  type = 'success',
  title, 
  message, 
  onHide
}) => {
  // Auto hide after 4 seconds for success notifications
  useEffect(() => {
    if (show && type === 'success') {
      const timer = setTimeout(() => {
        onHide && onHide();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [show, type, onHide]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="me-2" style={{ fontSize: '1.5em' }} />;
      case 'error':
        return <FaTimes className="me-2" style={{ fontSize: '1.5em' }} />;
      case 'warning':
        return <FaExclamationTriangle className="me-2" style={{ fontSize: '1.5em' }} />;
      case 'info':
        return <FaInfoCircle className="me-2" style={{ fontSize: '1.5em' }} />;
      default:
        return <FaCheckCircle className="me-2" style={{ fontSize: '1.5em' }} />;
    }
  };

  const getHeaderClass = () => {
    switch (type) {
      case 'success': return 'bg-success text-white';
      case 'error': return 'bg-danger text-white';
      case 'warning': return 'bg-warning text-dark';
      case 'info': return 'bg-info text-white';
      default: return 'bg-primary text-white';
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'primary';
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="sm"
      className="medicine-notification-modal"
      backdrop="static"
    >
      <Modal.Header className={getHeaderClass()} closeButton={false}>
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center flex-grow-1">
            {getIcon()}
            <Modal.Title className="mb-0 flex-grow-1" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              {title}
            </Modal.Title>
          </div>
          <Button
            variant="link"
            className="p-0 text-white ms-3"
            onClick={onHide}
            style={{ 
              fontSize: '1.5em',
              textDecoration: 'none',
              lineHeight: '1',
              minWidth: '30px',
              textAlign: 'center'
            }}
          >
            ×
          </Button>
        </div>
      </Modal.Header>
      
      {message && (
        <Modal.Body className="text-center py-4">
          <p className="mb-0" style={{ fontSize: '1.1em', lineHeight: '1.5' }}>
            {message}
          </p>
        </Modal.Body>
      )}
      
      <Modal.Footer className="justify-content-center border-0 pt-0">
        <Button 
          variant={getButtonVariant()} 
          onClick={onHide}
          size="lg"
          className="px-4"
        >
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MedicineNotification;
