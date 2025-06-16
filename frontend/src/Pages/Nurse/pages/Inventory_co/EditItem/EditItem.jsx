import React, { useState } from 'react';
import './EditItem.css';

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

const EditItem = ({ item, onClose, onEditItem }) => {
  const [loading, setLoading] = useState(false);
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
  // Xử lý thay đổi trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem({
      ...editedItem,
      [name]: name === 'stockQuantity' ? (value === '' ? '' : parseInt(value)) : value
    });
  };  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editedItem.itemName || !editedItem.unit || editedItem.stockQuantity === '' || !editedItem.itemType) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    try {
      setLoading(true);      // Format dates to 'yyyy-MM-dd' format before submitting
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
        // Gửi dữ liệu đã được định dạng lên server
      
      // Status được tính toán tự động dựa vào số lượng sản phẩm nên không cần truyền
      await onEditItem(formattedItem);
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật vật phẩm:", err);
      alert("Có lỗi xảy ra khi cập nhật vật phẩm. Vui lòng thử lại.");
    } finally {
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
          <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="itemName">Tên vật phẩm *</label>
            <input 
              type="text" 
              id="itemName" 
              name="itemName" 
              className="form-control"
              value={editedItem.itemName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="itemType">Loại *</label>
            <input 
              type="text" 
              id="itemType" 
              name="itemType" 
              className="form-control"
              value={editedItem.itemType}
              onChange={handleInputChange}
              placeholder="Thuốc, Thiết bị y tế, Vật tư tiêu hao, v.v..."
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stockQuantity">Số lượng *</label>
              <input 
                type="number" 
                id="stockQuantity" 
                name="stockQuantity" 
                className="form-control"
                value={editedItem.stockQuantity}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="unit">Đơn vị *</label>
              <input 
                type="text" 
                id="unit" 
                name="unit" 
                className="form-control"
                value={editedItem.unit}
                onChange={handleInputChange}
                placeholder="hộp, tuýp, cái..."
                required
              />
            </div>
          </div>
            <div className="form-group">
            <label htmlFor="manufactureDate">Ngày sản xuất</label>
            <input 
              type="date" 
              id="manufactureDate" 
              name="manufactureDate" 
              className="form-control"
              value={editedItem.manufactureDate ? formatDateForApi(editedItem.manufactureDate) : ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="expiryDate">Ngày hết hạn</label>
            <input 
              type="date" 
              id="expiryDate" 
              name="expiryDate" 
              className="form-control"
              value={editedItem.expiryDate ? formatDateForApi(editedItem.expiryDate) : ''}
              onChange={handleInputChange}
            />
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
