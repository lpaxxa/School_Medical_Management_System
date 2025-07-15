import React from 'react';

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

      <style jsx>{`
        .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }

        .delete-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 450px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease-out;
          overflow: hidden;
        }

        .delete-modal-header {
          background: #dc3545;
          color: white;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: none;
        }

        .delete-modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .delete-modal-close {
          background: transparent;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .delete-modal-close:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .delete-modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-modal-body {
          padding: 40px 24px;
          text-align: center;
        }

        .delete-icon-container {
          width: 80px;
          height: 80px;
          background: #fff2f2;
          border: 3px solid #dc3545;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .delete-icon {
          font-size: 32px;
          color: #dc3545;
        }

        .delete-question {
          color: #333;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 16px;
          line-height: 1.4;
        }

        .delete-warning {
          color: #666;
          font-size: 16px;
          margin: 0;
          line-height: 1.5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .warning-icon {
          color: #ffc107;
        }

        .delete-modal-footer {
          background: #f8f9fa;
          padding: 20px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #dee2e6;
        }

        .delete-btn-cancel,
        .delete-btn-confirm {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
          justify-content: center;
        }

        .delete-btn-cancel {
          background: #6c757d;
          color: white;
        }

        .delete-btn-cancel:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-1px);
        }

        .delete-btn-confirm {
          background: #dc3545;
          color: white;
          box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
        }

        .delete-btn-confirm:hover:not(:disabled) {
          background: #c82333;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
        }

        .delete-btn-cancel:disabled,
        .delete-btn-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .delete-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .delete-modal {
            margin: 20px;
            width: calc(100% - 40px);
          }
          
          .delete-modal-body {
            padding: 30px 20px;
          }
          
          .delete-modal-footer {
            flex-direction: column;
            gap: 8px;
          }
          
          .delete-btn-cancel,
          .delete-btn-confirm {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default DeleteConfirmModal;
