import React, { useState, useEffect } from 'react';
import '../InventoryMain.css';
import './AddItem.css';
import inventoryService from '../../../../../services/inventoryService';

const AddItem = ({ onClose, onAddItem }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    unit: '',
    quantity: '',
    category: '',
    expiryDate: '',
    dateAdded: new Date().toISOString().split('T')[0]
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
    setNewItem({
      ...newItem,
      [name]: name === 'quantity' ? (value === '' ? '' : parseInt(value)) : value
    });
  };
  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.unit || !newItem.quantity || !newItem.category) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    // Kiểm tra số lượng phải lớn hơn 0 khi thêm mới
    if (newItem.quantity <= 0) {
      alert("Số lượng phải lớn hơn 0 khi thêm vật phẩm mới!");
      return;
    }
    
    try {
      setLoading(true);
      // Tự động tính toán trạng thái dựa trên số lượng
      const itemToAdd = {
        ...newItem,
      };
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
  const currentStatus = newItem.quantity !== '' ? getItemStatus(newItem.quantity) : '';
  
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
            <label htmlFor="name">Tên vật phẩm *</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="form-control"
              value={newItem.name}
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
              value={newItem.category}
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
            <div className="form-group">              <label htmlFor="quantity">Số lượng * (Lớn hơn 0)</label>
              <input 
                type="number" 
                id="quantity" 
                name="quantity" 
                className="form-control"
                value={newItem.quantity}
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
            {/* Hiển thị trạng thái tự động dựa trên số lượng */}
          {newItem.quantity !== '' && (
            <div className="form-group">
              <label>Trạng thái (tự động):</label>
              <div className="auto-status-display">
                <span className={`status ${statusClass}`}>
                  {currentStatus}
                </span>
                <small className="status-help-text">
                  Trạng thái được tính tự động dựa vào số lượng
                  {newItem.quantity <= 0 && <span className="quantity-warning"> - Số lượng phải lớn hơn 0 khi thêm mới!</span>}
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
              {loading ? 'Đang thêm...' : 'Thêm vật phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
