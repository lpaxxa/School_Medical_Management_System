import React, { useState, useEffect } from 'react';
import '../InventoryMain.css';
import './AddItem.css';
import inventoryService from '../../../../../services/inventoryService';

const AddItem = ({ onClose, onAddItem }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: '',
    unit: '',
    stockQuantity: 0,
    itemType: '',
    expiryDate: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    itemDescription: ''
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
    // Sử dụng danh sách cố định thay vì gọi API
    setCategories(['Thuốc', 'Thiết bị y tế', 'Vật tư tiêu hao', 'Khác']);
  }, []);

  // Xử lý thay đổi trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'stockQuantity' ? (value === '' ? 0 : parseInt(value)) : value
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newItem.itemName || !newItem.unit || !newItem.stockQuantity || !newItem.itemType) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    // Kiểm tra số lượng phải lớn hơn 0 khi thêm mới
    if (newItem.stockQuantity <= 0) {
      alert("Số lượng phải lớn hơn 0 khi thêm vật phẩm mới!");
      return;
    }
    
    try {
      setLoading(true);
      
      // Định dạng dữ liệu theo cấu trúc API
      const itemToAdd = {
        ...newItem,
        // createdAt sẽ được tạo tự động ở backend
      };
      
      // Format ngày tháng để phù hợp với API
      if (itemToAdd.manufactureDate) {
        itemToAdd.manufactureDate = itemToAdd.manufactureDate.split('T')[0];
      }
      
      if (itemToAdd.expiryDate) {
        itemToAdd.expiryDate = itemToAdd.expiryDate.split('T')[0];
      }
      
      await onAddItem(itemToAdd);
      onClose();
    } catch (err) {
      console.error("Lỗi khi thêm vật phẩm:", err);
      alert("Có lỗi xảy ra khi thêm vật phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  // Xác định trạng thái hiện tại dựa trên số lượng đã nhập
  const currentStatus = getItemStatus(newItem.stockQuantity);
  
  // Xác định class CSS cho trạng thái
  const statusClass = 
    currentStatus === 'Sẵn có' ? 'available' : 
    currentStatus === 'Sắp hết' ? 'low' : 
    currentStatus === 'Hết hàng' ? 'out' : '';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Thêm vật phẩm mới</h3>
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
              value={newItem.itemName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="itemType">Loại *</label>
            <select 
              id="itemType" 
              name="itemType" 
              className="form-control"
              value={newItem.itemType}
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
              <label htmlFor="stockQuantity">Số lượng * (Lớn hơn 0)</label>
              <input 
                type="number" 
                id="stockQuantity" 
                name="stockQuantity" 
                className="form-control"
                value={newItem.stockQuantity}
                onChange={handleInputChange}
                min="1"
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
                value={newItem.unit}
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
              value={newItem.manufactureDate}
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
              value={newItem.expiryDate}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="itemDescription">Mô tả</label>
            <textarea 
              id="itemDescription" 
              name="itemDescription" 
              className="form-control"
              value={newItem.itemDescription}
              onChange={handleInputChange}
              placeholder="Nhập mô tả về vật phẩm..."
              rows="3"
            />
          </div>          {/* Hiển thị trạng thái tự động dựa trên số lượng */}
          <div className="form-group">
            <label>Trạng thái (tự động):</label>
            <div className="auto-status-display">
              <span className={`status ${statusClass}`}>
                {currentStatus}
              </span>
              <small className="status-help-text">
                Trạng thái được tính tự động dựa vào số lượng
                {newItem.stockQuantity <= 0 && <span className="quantity-warning"> - Số lượng phải lớn hơn 0 khi thêm mới!</span>}
              </small>
            </div>
          </div>
          
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
              {loading ? 'Đang thêm...' : 'Thêm vật phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
