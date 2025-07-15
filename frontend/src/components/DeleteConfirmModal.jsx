import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmModal = ({ show, onClose, onConfirm, itemName = "mục này", loading = false }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>
          <i className="fas fa-exclamation-triangle me-2"></i>
          Xác nhận xóa
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <i className="fas fa-trash-alt fa-3x text-danger mb-3"></i>
          <h5>Bạn có chắc chắn muốn xóa {itemName}?</h5>
          <p className="text-muted">
            Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onClose}
          disabled={loading}
        >
          <i className="fas fa-times me-2"></i>
          Hủy bỏ
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Đang xóa...
            </>
          ) : (
            <>
              <i className="fas fa-trash me-2"></i>
              Xóa
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;
