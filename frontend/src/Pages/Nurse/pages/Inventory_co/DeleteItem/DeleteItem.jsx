import React, { useState } from 'react';
import './DeleteItem.css';
import { toast } from 'react-toastify';

const DeleteItem = ({ item, onClose, onDeleteItem }) => {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    try {
      setLoading(true);
      console.log('Deleting item with itemId:', item.itemId);
      
      // Call the parent component's onDeleteItem with the item's itemId
      await onDeleteItem(item.itemId);
      
      // Thông báo thành công
      toast.success('Xóa vật phẩm thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Đóng modal
      onClose();
    } catch (err) {
      console.error("Lỗi khi xóa vật tư:", err);
      toast.error("Có lỗi xảy ra khi xóa vật phẩm. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bootstrap Modal */}
      <div 
        className="modal fade show" 
        style={{ display: 'block' }} 
        tabIndex="-1" 
        role="dialog"
        aria-labelledby="deleteItemModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow-lg">
            {/* Modal Header */}
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title" id="deleteItemModal">
                <i className="fas fa-trash-alt me-2"></i>
                Xác nhận xóa
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body p-4">
              <div className="text-center mb-4">
                <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
              </div>
              
              <div className="text-center mb-4">
                <h6 className="mb-3">Bạn có chắc chắn muốn xóa vật phẩm này không?</h6>
                <div className="alert alert-warning" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Cảnh báo:</strong> Thao tác này không thể hoàn tác!
                </div>
              </div>
              
              <div className="card">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Thông tin vật phẩm
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-4 fw-bold">ID:</div>
                    <div className="col-8">{item.itemId}</div>
                  </div>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-4 fw-bold">Tên vật phẩm:</div>
                    <div className="col-8">
                      <span className="badge bg-primary">{item.itemName || item.name}</span>
                    </div>
                  </div>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-4 fw-bold">Loại:</div>
                    <div className="col-8">{item.itemType || item.category || 'N/A'}</div>
                  </div>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-4 fw-bold">Số lượng:</div>
                    <div className="col-8">
                      <span className="fw-bold">{item.stockQuantity || item.quantity}</span> {item.unit}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer bg-light">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                onClick={onClose}
                disabled={loading}
              >
                <i className="fas fa-times me-1"></i>
                Hủy
              </button>
              <button 
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt me-1"></i>
                    Xác nhận xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default DeleteItem;
