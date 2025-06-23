import React, { useState } from 'react';
import '../InventoryMain.css';
import './EditItem.css';
import inventoryService from '../../../../../services/inventoryService';

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
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật vật phẩm:", err);
      
      // Kiểm tra các trường hợp lỗi cụ thể từ API
      if (err.response && err.response.data) {
        // Xử lý lỗi từ backend Spring Boot
        if (typeof err.response.data === 'string') {
          if (err.response.data.includes("already exists") || 
              err.response.data.includes("đã tồn tại")) {
            setErrors({
              ...errors,
              itemName: "Tên vật phẩm đã tồn tại trong hệ thống"
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
          setErrors({
            ...errors,
            itemName: "Tên vật phẩm đã tồn tại trong hệ thống"
          });
        } else {
          setErrors({
            ...errors,
            submit: err.message
          });
        }
      } else {
        // Lỗi không xác định
        setErrors({
          ...errors,
          submit: "Có lỗi xảy ra khi cập nhật vật phẩm."
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Sửa thông tin vật phẩm</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
          <form onSubmit={handleSubmit}>          <div className="form-group">            <label htmlFor="itemName">Tên vật phẩm <span className="required-mark">*</span></label>
            <div>
              <input 
                type="text" 
                id="itemName" 
                name="itemName" 
                className={`form-control ${errors.itemName ? 'is-invalid' : ''}`}
                value={editedItem.itemName}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.itemName && <div className="invalid-feedback">{errors.itemName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="itemType">Loại <span className="required-mark">*</span></label>
            <input 
              type="text" 
              id="itemType" 
              name="itemType" 
              className={`form-control ${errors.itemType ? 'is-invalid' : ''}`}
              value={editedItem.itemType}
              onChange={handleInputChange}
              placeholder="Thuốc, Thiết bị y tế, v.v..."
              required
            />
            {errors.itemType && <div className="invalid-feedback">{errors.itemType}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stockQuantity">Số lượng <span className="required-mark">*</span></label>
              <input 
                type="number" 
                id="stockQuantity" 
                name="stockQuantity" 
                className={`form-control ${errors.stockQuantity ? 'is-invalid' : ''}`}
                value={editedItem.stockQuantity}
                onChange={handleInputChange}
                min="0"
                max="10000"
                required
              />
              {errors.stockQuantity && <div className="invalid-feedback">{errors.stockQuantity}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="unit">Đơn vị <span className="required-mark">*</span></label>
              <input 
                type="text" 
                id="unit" 
                name="unit" 
                className={`form-control ${errors.unit ? 'is-invalid' : ''}`}
                value={editedItem.unit}
                onChange={handleInputChange}
                placeholder="hộp, tuýp, cái..."
                required
              />
              {errors.unit && <div className="invalid-feedback">{errors.unit}</div>}
            </div>
          </div>
            <div className="form-group">
            <label htmlFor="manufactureDate">Ngày sản xuất</label>
            <input 
              type="date" 
              id="manufactureDate" 
              name="manufactureDate" 
              className={`form-control ${errors.manufactureDate ? 'is-invalid' : ''}`}
              value={editedItem.manufactureDate ? formatDateForApi(editedItem.manufactureDate) : ''}
              onChange={handleInputChange}
            />
            {errors.manufactureDate && <div className="invalid-feedback">{errors.manufactureDate}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="expiryDate">Ngày hết hạn</label>
            <input 
              type="date" 
              id="expiryDate" 
              name="expiryDate" 
              className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
              value={editedItem.expiryDate ? formatDateForApi(editedItem.expiryDate) : ''}
              onChange={handleInputChange}
            />
            {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="itemDescription">Mô tả</label>
            <textarea 
              id="itemDescription" 
              name="itemDescription" 
              className="form-control"
              value={editedItem.itemDescription}
              onChange={handleInputChange}
              rows="3"
              placeholder="Nhập mô tả về vật phẩm..."
            />
          </div>            {/* Hiển thị trạng thái tự động dựa trên số lượng */}
          {editedItem.stockQuantity !== '' && (
            <div className="form-group">
              <label>Trạng thái (tự động):</label>
              <div className="auto-status-display">
                <span className={`status ${statusClass}`}>
                  {currentStatus}
                </span>
                <small className="status-help-text">
                  Trạng thái được tính tự động dựa vào số lượng
                </small>
              </div>
            </div>
          )}
            {errors.submit && (
            <div className="alert alert-danger">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
