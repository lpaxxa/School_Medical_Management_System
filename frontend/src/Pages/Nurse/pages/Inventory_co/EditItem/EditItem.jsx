import React, { useState } from 'react';
import '../InventoryMain.css';
import './EditItem.css';
import { toast } from 'react-toastify';

// Hàm định dạng ngày từ form input sang định dạng API yêu cầu (yyyy-MM-dd)
const formatDateForApi = (dateString) => {
  if (!dateString) return '';
  
  try {
    // Nếu đã đúng định dạng yyyy-MM-dd rồi thì giữ nguyên
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Chuyển đổi từ các định dạng khác sang yyyy-MM-dd
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Trả về nguyên bản nếu không phải date hợp lệ
    
    return date.toISOString().split('T')[0]; // Trả về yyyy-MM-dd
  } catch (err) {
    console.error('Lỗi khi định dạng ngày:', err);
    return dateString;
  }
};

// Component chỉnh sửa vật phẩm
const EditItem = ({ item, onClose, onEditItem }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Khởi tạo trạng thái edit từ dữ liệu gốc
    // Map fields from different possible structures to a consistent one
  const [editedItem, setEditedItem] = useState({
    itemId: item.itemId, // Sử dụng itemId thay vì id
    itemName: item.itemName || item.name || '',
    unit: item.unit || '',
    stockQuantity: item.stockQuantity || item.quantity || 0,
    itemType: item.itemType || item.category || '',
    expiryDate: item.expiryDate || '',
    manufactureDate: item.manufactureDate || item.dateAdded || '',
    itemDescription: item.itemDescription || item.description || ''
  });

  // Hàm tính toán trạng thái dựa trên số lượng
  const getItemStatus = (quantity) => {
    if (quantity === 0) {
      return 'Hết hàng';
    } else if (quantity <= 20) {
      return 'Sắp hết';
    } else {
      return 'Sẵn có';
    }
  };
  
  // Kiểm tra lỗi khi người dùng nhập liệu
  const validateForm = () => {
    const newErrors = {};
    
    // Kiểm tra các trường bắt buộc
    if (!editedItem.itemName) {
      newErrors.itemName = "Tên vật phẩm là bắt buộc";
    }
    
    if (!editedItem.itemType) {
      newErrors.itemType = "Loại vật phẩm là bắt buộc";
    }
    
    if (!editedItem.unit) {
      newErrors.unit = "Đơn vị là bắt buộc";
    }
    
    // Kiểm tra số lượng
    if (editedItem.stockQuantity < 0) {
      newErrors.stockQuantity = "Số lượng không được nhỏ hơn 0";
    } else if (editedItem.stockQuantity > 10000) {
      newErrors.stockQuantity = "Số lượng không được vượt quá 10000";
    }
    
    // Kiểm tra ngày hết hạn và ngày sản xuất
    if (editedItem.expiryDate && editedItem.manufactureDate) {
      const expiryDate = new Date(editedItem.expiryDate);
      const manufactureDate = new Date(editedItem.manufactureDate);
      
      if (expiryDate < manufactureDate) {
        newErrors.expiryDate = "Ngày hết hạn không được trước ngày sản xuất";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
    // Xử lý thay đổi trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let parsedValue = value;
    if (name === 'stockQuantity') {
      parsedValue = value === '' ? '' : parseInt(value);
    }
    
    setEditedItem({
      ...editedItem,
      [name]: parsedValue
    });
    
    // Xóa lỗi khi người dùng sửa
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form trước khi submit
    if (!validateForm()) {
      return;
    }
    
    // Kiểm tra nếu đã có lỗi tên vật phẩm, thì không submit
    if (errors.itemName) {
      return;
    }
    
    try {
      setLoading(true);      
      // Format dates to 'yyyy-MM-dd' format before submitting
      const formattedItem = {
        ...editedItem,
        itemId: item.itemId, // Đảm bảo itemId luôn được lấy từ item gốc
        manufactureDate: editedItem.manufactureDate ? formatDateForApi(editedItem.manufactureDate) : undefined,
        expiryDate: editedItem.expiryDate ? formatDateForApi(editedItem.expiryDate) : undefined
      };
      
      // Đảm bảo không có trường id để tránh xung đột với itemId
      if (formattedItem.id !== undefined) {
        delete formattedItem.id;
      }
      
      // Status được tính toán tự động dựa vào số lượng sản phẩm nên không cần truyền
      await onEditItem(formattedItem);
      toast.success('Cập nhật vật phẩm thành công!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật vật phẩm:", err);
      
      // Kiểm tra các trường hợp lỗi cụ thể từ API
      if (err.response && err.response.data) {
        // Xử lý lỗi từ backend Spring Boot
        if (typeof err.response.data === 'string') {
          if (err.response.data.includes("already exists") || 
              err.response.data.includes("đã tồn tại")) {
            const errorMsg = "Tên vật phẩm đã tồn tại trong hệ thống";
            setErrors({
              ...errors,
              itemName: errorMsg
            });
            toast.error(errorMsg, {
              position: "top-right",
              autoClose: 5000,
            });
            setLoading(false);
            return; // Dừng xử lý sau khi đã set lỗi
          }
        }
      }
      
      // Xử lý lỗi từ message
      if (err.message) {
        if (err.message.includes("already exists") || 
            err.message.includes("đã tồn tại") || 
            err.message.includes("trùng") || 
            err.message.includes("tồn tại")) {
          const errorMsg = "Tên vật phẩm đã tồn tại trong hệ thống";
          setErrors({
            ...errors,
            itemName: errorMsg
          });
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          const errorMsg = err.message;
          setErrors({
            ...errors,
            submit: errorMsg
          });
          toast.error(`Lỗi: ${errorMsg}`, {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } else {
        // Lỗi không xác định
        const errorMsg = "Có lỗi xảy ra khi cập nhật vật phẩm.";
        setErrors({
          ...errors,
          submit: errorMsg
        });
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 5000,
        });
      }
      setLoading(false);
    }
  };
  // Xác định trạng thái hiện tại dựa trên số lượng đã nhập
  const currentStatus = editedItem.stockQuantity !== '' ? getItemStatus(editedItem.stockQuantity) : '';
  
  // Xác định class CSS cho trạng thái
  const statusClass = 
    currentStatus === 'Sẵn có' ? 'available' : 
    currentStatus === 'Sắp hết' ? 'low' : 
    currentStatus === 'Hết hàng' ? 'out' : '';

  return (
    <>
      {/* Bootstrap Modal */}
      <div 
        className="modal fade show" 
        style={{ display: 'block' }} 
        tabIndex="-1" 
        role="dialog"
        aria-labelledby="editItemModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content shadow-lg">
            {/* Modal Header */}
            <div className="modal-header bg-warning text-dark">
              <h5 className="modal-title" id="editItemModal">
                <i className="fas fa-edit me-2"></i>
                Sửa thông tin vật phẩm
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body p-4">
              <form id="editItemForm" onSubmit={handleSubmit}>
                <div className="container-fluid">
                  {/* Tên vật phẩm */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <label htmlFor="itemName" className="form-label fw-bold">
                        <i className="fas fa-tag me-1"></i>
                        Tên vật phẩm <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.itemName ? 'is-invalid' : ''}`}
                        id="itemName"
                        name="itemName"
                        value={editedItem.itemName}
                        onChange={handleInputChange}
                        placeholder="Nhập tên vật phẩm..."
                        required
                      />
                      {errors.itemName && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.itemName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Loại vật phẩm */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <label htmlFor="itemType" className="form-label fw-bold">
                        <i className="fas fa-list me-1"></i>
                        Loại <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.itemType ? 'is-invalid' : ''}`}
                        id="itemType"
                        name="itemType"
                        value={editedItem.itemType}
                        onChange={handleInputChange}
                        placeholder="Thuốc, Thiết bị y tế, v.v..."
                        required
                      />
                      {errors.itemType && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.itemType}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Số lượng và Đơn vị */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="stockQuantity" className="form-label fw-bold">
                        <i className="fas fa-boxes me-1"></i>
                        Số lượng <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.stockQuantity ? 'is-invalid' : ''}`}
                        id="stockQuantity"
                        name="stockQuantity"
                        value={editedItem.stockQuantity}
                        onChange={handleInputChange}
                        min="0"
                        max="10000"
                        required
                      />
                      {errors.stockQuantity && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.stockQuantity}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="unit" className="form-label fw-bold">
                        <i className="fas fa-ruler me-1"></i>
                        Đơn vị <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.unit ? 'is-invalid' : ''}`}
                        id="unit"
                        name="unit"
                        value={editedItem.unit}
                        onChange={handleInputChange}
                        placeholder="hộp, tuýp, cái..."
                        required
                      />
                      {errors.unit && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.unit}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ngày sản xuất và Ngày hết hạn */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="manufactureDate" className="form-label fw-bold">
                        <i className="fas fa-calendar-alt me-1"></i>
                        Ngày sản xuất
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.manufactureDate ? 'is-invalid' : ''}`}
                        id="manufactureDate"
                        name="manufactureDate"
                        value={editedItem.manufactureDate ? formatDateForApi(editedItem.manufactureDate) : ''}
                        onChange={handleInputChange}
                      />
                      {errors.manufactureDate && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.manufactureDate}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="expiryDate" className="form-label fw-bold">
                        <i className="fas fa-calendar-times me-1"></i>
                        Ngày hết hạn
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
                        id="expiryDate"
                        name="expiryDate"
                        value={editedItem.expiryDate ? formatDateForApi(editedItem.expiryDate) : ''}
                        onChange={handleInputChange}
                      />
                      {errors.expiryDate && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.expiryDate}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mô tả */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <label htmlFor="itemDescription" className="form-label fw-bold">
                        <i className="fas fa-align-left me-1"></i>
                        Mô tả
                      </label>
                      <textarea
                        className="form-control"
                        id="itemDescription"
                        name="itemDescription"
                        value={editedItem.itemDescription}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Nhập mô tả về vật phẩm..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Trạng thái tự động */}
                  {editedItem.stockQuantity !== '' && (
                    <div className="row mb-3">
                      <div className="col-12">
                        <label className="form-label fw-bold">
                          <i className="fas fa-info-circle me-1"></i>
                          Trạng thái (tự động):
                        </label>
                        <div className="d-flex align-items-center mt-2">
                          <span className={`badge fs-6 me-3 ${
                            currentStatus === 'Sẵn có' ? 'bg-success' :
                            currentStatus === 'Sắp hết' ? 'bg-warning text-dark' :
                            'bg-danger'
                          }`}>
                            <i className="fas fa-circle me-1"></i>
                            {currentStatus}
                          </span>
                          <small className="text-muted">
                            Trạng thái được tính tự động dựa vào số lượng
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {errors.submit && (
                    <div className="row mb-3">
                      <div className="col-12">
                        <div className="alert alert-danger d-flex align-items-center" role="alert">
                          <i className="fas fa-exclamation-circle me-2"></i>
                          <div>{errors.submit}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer bg-light">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                onClick={onClose}
              >
                <i className="fas fa-times me-1"></i>
                Hủy
              </button>
              <button 
                type="submit"
                form="editItemForm"
                className="btn btn-warning"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>
                    Lưu thay đổi
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

export default EditItem;
