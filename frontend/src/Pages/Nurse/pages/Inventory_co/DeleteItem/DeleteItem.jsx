import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './DeleteItem.css';

// Custom styles để tránh xung đột Bootstrap và tăng kích thước modal
const deleteItemModalStyles = `
  /* Delete Item Modal - Namespaced Styles */
  .delete-item-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
    opacity: 1;
    visibility: visible;
  }
  
  .delete-item-modal-dialog {
    width: 90%;
    max-width: 650px;
    max-height: 90vh;
    margin: 1rem;
  }
  
  .delete-item-modal-content {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }
  
  .delete-item-modal-header {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
  }
  
  .delete-item-modal-title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 600;
    display: flex;
    align-items: center;
  }
  
  .delete-item-btn-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease;
  }
  
  .delete-item-btn-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .delete-item-modal-body {
    padding: 1.75rem;
    flex: 1;
    overflow-y: auto;
  }
  
  .delete-item-text-center {
    text-align: center;
  }
  
  .delete-item-mb-4 {
    margin-bottom: 1.5rem;
  }
  
  .delete-item-mb-3 {
    margin-bottom: 1rem;
  }
  
  .delete-item-warning-icon {
    font-size: 3.5rem;
    color: #ffc107;
    margin-bottom: 1rem;
  }
  
  .delete-item-alert {
    padding: 1rem 1.25rem;
    border: 1px solid #ffeaa7;
    border-radius: 0.5rem;
    background-color: #fff8e1;
    color: #856404;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .delete-item-confirmation-text {
    font-size: 1.1rem;
    font-weight: 500;
    color: #495057;
    margin-bottom: 1rem;
  }
  
  .delete-item-info-card {
    border: 1px solid #e9ecef;
    border-radius: 0.5rem;
    overflow: hidden;
    background: #fff;
  }
  
  .delete-item-card-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 0.875rem 1.25rem;
    border-bottom: 1px solid #e9ecef;
  }
  
  .delete-item-card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #495057;
    display: flex;
    align-items: center;
  }
  
  .delete-item-card-body {
    padding: 1.25rem;
  }
  
  .delete-item-info-row {
    display: flex;
    margin-bottom: 0.75rem;
    padding: 0.5rem 0;
  }
  
  .delete-item-info-row:not(:last-child) {
    border-bottom: 1px solid #f1f3f4;
  }
  
  .delete-item-label {
    flex: 0 0 35%;
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
  }
  
  .delete-item-value {
    flex: 1;
    color: #6c757d;
    font-size: 0.9rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .delete-item-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 500;
    line-height: 1;
    color: white;
    background-color: #007bff;
    border-radius: 0.375rem;
    max-width: 100%;
    word-wrap: break-word;
  }
  
  .delete-item-quantity {
    font-weight: 600;
    color: #28a745;
  }
  
  .delete-item-modal-footer {
    background-color: #f8f9fa;
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
  
  .delete-item-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.6rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.5;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .delete-item-btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
  }
  
  .delete-item-btn-secondary:hover {
    background-color: #5a6268;
    border-color: #545b62;
  }
  
  .delete-item-btn-danger {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
  }
  
  .delete-item-btn-danger:hover {
    background-color: #c82333;
    border-color: #bd2130;
  }
  
  .delete-item-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .delete-item-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: delete-item-spin 1s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes delete-item-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .delete-item-modal-dialog {
      width: 95%;
      margin: 0.5rem;
    }
    
    .delete-item-modal-body {
      padding: 1.25rem;
    }
    
    .delete-item-info-row {
      flex-direction: column;
    }
    
    .delete-item-label {
      flex: none;
      margin-bottom: 0.25rem;
    }
  }
  
  /* Utility Classes */
  .delete-item-me-1 { margin-right: 0.25rem; }
  .delete-item-me-2 { margin-right: 0.5rem; }

  /* Custom Toast Styles */
  .delete-item-toast-success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
    color: white !important;
    border-radius: 0.75rem !important;
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3) !important;
    border: none !important;
    font-weight: 500 !important;
  }
  
  .delete-item-toast-success .Toastify__toast-body {
    padding: 0.75rem !important;
    font-size: 0.95rem !important;
  }
  
  .delete-item-toast-success .Toastify__progress-bar {
    background: rgba(255, 255, 255, 0.8) !important;
  }
  
  .delete-item-toast-error {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
    color: white !important;
    border-radius: 0.75rem !important;
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3) !important;
    border: none !important;
    font-weight: 500 !important;
  }
  
  .delete-item-toast-error .Toastify__toast-body {
    padding: 0.75rem !important;
    font-size: 0.95rem !important;
  }
  
  .delete-item-toast-error .Toastify__progress-bar {
    background: rgba(255, 255, 255, 0.8) !important;
  }
`;

const DeleteItemModal = ({ item, onClose, onDeleteItem }) => {
  const [loading, setLoading] = useState(false);
  
  // Function to handle the actual deletion
  const handleDeleteItem = async () => {
    setLoading(true);
    try {
      // Use the onDeleteItem prop which should handle the API call
      await onDeleteItem(item.itemId); // Make sure to use itemId
      
      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'Xóa thành công!',
        text: `Vật phẩm "${item.itemName}" đã được xóa khỏi kho.`,
        timer: 2000,
        showConfirmButton: false
      });

      onClose(); // Close the modal on success
    } catch (error) {
      console.error('Lỗi khi xóa vật phẩm:', error);
      
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: `Không thể xóa vật phẩm. Lỗi: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{deleteItemModalStyles}</style>
      {/* Custom Modal */}
      <div className="delete-item-modal-overlay">
        <div className="delete-item-modal-dialog">
          <div className="delete-item-modal-content">
            {/* Modal Header */}
            <div className="delete-item-modal-header">
              <h5 className="delete-item-modal-title" style={{color: 'white'}}>
                <i className="fas fa-trash-alt delete-item-me-2" style={{color: 'white'}}></i>
                Xác nhận xóa vật phẩm
              </h5>
              <button 
                type="button" 
                className="delete-item-btn-close"
                onClick={onClose}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="delete-item-modal-body">
              <div className="delete-item-text-center delete-item-mb-4">
                <i className="fas fa-exclamation-triangle delete-item-warning-icon"></i>
              </div>
              
              <div className="delete-item-text-center delete-item-mb-4">
                <h6 className="delete-item-confirmation-text">
                  Bạn có chắc chắn muốn xóa vật phẩm này không?
                </h6>
                <div className="delete-item-alert">
                  <i className="fas fa-exclamation-triangle delete-item-me-2"></i>
                  <strong>Cảnh báo:</strong> Thao tác này không thể hoàn tác!
                </div>
              </div>
              
              <div className="delete-item-info-card">
                <div className="delete-item-card-header">
                  <h6 className="delete-item-card-title">
                    <i className="fas fa-info-circle delete-item-me-2"></i>
                    Thông tin vật phẩm sẽ bị xóa
                  </h6>
                </div>
                <div className="delete-item-card-body">
                  <div className="delete-item-info-row">
                    <div className="delete-item-label">ID:</div>
                    <div className="delete-item-value">{item.itemId}</div>
                  </div>
                  
                  <div className="delete-item-info-row">
                    <div className="delete-item-label">Tên vật phẩm:</div>
                    <div className="delete-item-value">
                      <span className="delete-item-badge">
                        {item.itemName || item.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="delete-item-info-row">
                    <div className="delete-item-label">Loại:</div>
                    <div className="delete-item-value">
                      {item.itemType || item.category || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="delete-item-info-row">
                    <div className="delete-item-label">Số lượng:</div>
                    <div className="delete-item-value">
                      <span className="delete-item-quantity">
                        {item.stockQuantity || item.quantity}
                      </span> {item.unit}
                    </div>
                  </div>
                  
                  {(item.itemDescription || item.description) && (
                    <div className="delete-item-info-row">
                      <div className="delete-item-label">Mô tả:</div>
                      <div className="delete-item-value">
                        {item.itemDescription || item.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="delete-item-modal-footer">
              <button 
                type="button" 
                className="delete-item-btn delete-item-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                <i className="fas fa-times delete-item-me-1"></i>
                Hủy
              </button>
              <button 
                type="button"
                className="delete-item-btn delete-item-btn-danger"
                onClick={handleDeleteItem}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="delete-item-spinner"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt delete-item-me-1"></i>
                    Xác nhận xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteItemModal;
