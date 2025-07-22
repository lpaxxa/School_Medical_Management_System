import React from 'react';
import './MedicalIncidents.css';

const DeleteConfirmModal = ({ show, onClose, onConfirm, itemName = "mục này", loading = false }) => {
  if (!show) return null;

  return (
    <div 
      className="delete-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }}
    >
      <div 
        className="delete-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div className="delete-modal-header">
          <h3 className="delete-modal-title"  style={{color : '#fff'}}>
            <i className="fas fa-exclamation-triangle" style={{color : '#fff'}}></i>
            Xác nhận xóa
          </h3>
          <button 
            className="delete-modal-close" 
            onClick={onClose}
            disabled={loading}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="delete-modal-body">
          <div className="delete-icon-container">
            <i className="fas fa-trash-alt delete-icon"></i>
          </div>
          <h4 className="delete-question">
            Bạn có chắc chắn muốn xóa {itemName}?
          </h4>
          <p className="delete-warning">
            <i className="fas fa-info-circle warning-icon"></i>
            Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.
          </p>
        </div>

        {/* Footer */}
        <div className="delete-modal-footer">
          <button 
            className="delete-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            <i className="fas fa-times"></i>
            Hủy bỏ
          </button>
          <button 
            className="delete-btn-confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="delete-spinner"></span>
                Đang xóa...
              </>
            ) : (
              <>
                <i className="fas fa-trash"></i>
                Xóa
              </>
            )}
          </button>
        </div>
      </div>


    </div>
  );
};

export default DeleteConfirmModal;
