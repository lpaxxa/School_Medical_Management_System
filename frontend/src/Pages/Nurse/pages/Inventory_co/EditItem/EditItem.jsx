import React, { useState, useEffect } from 'react';
import './EditItem.css';
import inventoryService from '../../../../../services/inventoryService';

const EditItem = ({ item, onClose, onEditItem }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editedItem, setEditedItem] = useState({
    id: item.id,
    name: item.name,
    unit: item.unit,
    quantity: item.quantity,
    category: item.category,
    expiryDate: item.expiryDate || '',
    dateAdded: item.dateAdded
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

  // Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await inventoryService.getCategories();
        setCategories(cats || ['Thuốc', 'Thiết bị y tế', 'Vật tư tiêu hao', 'Khác']);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
        setCategories(['Thuốc', 'Thiết bị y tế', 'Vật tư tiêu hao', 'Khác']);
      }
    };

    fetchCategories();
  }, []);
  // Xử lý thay đổi trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem({
      ...editedItem,
      [name]: name === 'quantity' ? (value === '' ? '' : parseInt(value)) : value
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editedItem.name || !editedItem.unit || !editedItem.quantity || !editedItem.category) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    try {
      setLoading(true);
      
      // Status được tính toán tự động dựa vào số lượng sản phẩm nên không cần truyền
      await onEditItem(editedItem);
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật vật phẩm:", err);
      alert("Có lỗi xảy ra khi cập nhật vật phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  // Xác định trạng thái hiện tại dựa trên số lượng đã nhập
  const currentStatus = editedItem.quantity !== '' ? getItemStatus(editedItem.quantity) : '';
  
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
            <label htmlFor="name">Tên vật phẩm *</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="form-control"
              value={editedItem.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Loại *</label>
            <select 
              id="category" 
              name="category" 
              className="form-control"
              value={editedItem.category}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Chọn loại --</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Số lượng *</label>
              <input 
                type="number" 
                id="quantity" 
                name="quantity" 
                className="form-control"
                value={editedItem.quantity}
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
            <label htmlFor="expiryDate">Ngày hết hạn</label>
            <input 
              type="date" 
              id="expiryDate" 
              name="expiryDate" 
              className="form-control"
              value={editedItem.expiryDate}
              onChange={handleInputChange}
            />
          </div>
            {/* Hiển thị trạng thái tự động dựa trên số lượng */}
          {editedItem.quantity !== '' && (
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
