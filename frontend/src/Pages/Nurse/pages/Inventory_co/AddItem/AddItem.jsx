import React, { useState, useEffect } from 'react';
import '../InventoryMain.css';
import './AddItem.css';
import inventoryService from '../../../../../services/inventoryService';

const AddItem = ({ onClose, onAddItem }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newItem, setNewItem] = useState({
    itemName: '',
    unit: '',
    stockQuantity: 0,
    itemType: '',
    expiryDate: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    itemDescription: ''
  });

  const getItemStatus = (quantity) => {
    if (quantity === 0) return 'Hết hàng';
    if (quantity <= 20) return 'Sắp hết';
    return 'Sẵn có';
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await inventoryService.getCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!newItem.itemName) newErrors.itemName = "Tên vật phẩm là bắt buộc";
    if (!newItem.itemType) newErrors.itemType = "Loại vật phẩm là bắt buộc";
    if (!newItem.unit) newErrors.unit = "Đơn vị là bắt buộc";

    if (newItem.stockQuantity < 0) {
      newErrors.stockQuantity = "Số lượng không được nhỏ hơn 0";
    } else if (newItem.stockQuantity > 10000) {
      newErrors.stockQuantity = "Số lượng không được vượt quá 10000";
    }

    if (newItem.expiryDate && newItem.manufactureDate) {
      const expiryDate = new Date(newItem.expiryDate);
      const manufactureDate = new Date(newItem.manufactureDate);
      if (expiryDate < manufactureDate) {
        newErrors.expiryDate = "Ngày hết hạn không được trước ngày sản xuất";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    if (name === 'stockQuantity') {
      parsedValue = value === '' ? 0 : parseInt(value);
    }

    setNewItem({
      ...newItem,
      [name]: parsedValue
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (errors.itemName) return;

    try {
      setLoading(true);

      const itemToAdd = { ...newItem };

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

      const isDuplicateNameError = (msg) =>
        msg.includes("already exists") || msg.includes("đã tồn tại") || msg.includes("Medication item with this name already exists");

      let message = "";

      if (err.response && err.response.data) {
        const data = err.response.data;

        if (typeof data === 'string' && isDuplicateNameError(data)) {
          message = "Tên vật phẩm đã tồn tại trong hệ thống";
        } else if (typeof data === 'object' && data.message && isDuplicateNameError(data.message)) {
          message = "Tên vật phẩm đã tồn tại trong hệ thống";
        } else {
          message = typeof data === 'string' ? data : data.message || "Lỗi không xác định từ server";
        }
      } else if (err.message && isDuplicateNameError(err.message)) {
        message = "Tên vật phẩm đã tồn tại trong hệ thống";
      } else {
        message = err.message || "Có lỗi xảy ra khi thêm vật phẩm.";
      }

      if (message.includes("tồn tại")) {
        setErrors(prev => ({
          ...prev,
          itemName: message
        }));

        setTimeout(() => {
          window.alert("Lỗi: " + message);
        }, 50);
      } else {
        setErrors(prev => ({
          ...prev,
          submit: message
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = getItemStatus(newItem.stockQuantity);
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
            <label htmlFor="itemName">Tên vật phẩm <span className="required-mark">*</span></label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              className={`form-control ${errors.itemName ? 'is-invalid' : ''}`}
              value={newItem.itemName}
              onChange={handleInputChange}
              required
            />
            {errors.itemName && <div className="invalid-feedback">{errors.itemName}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="itemType">Loại <span className="required-mark">*</span></label>
            <input
              type="text"
              id="itemType"
              name="itemType"
              className={`form-control ${errors.itemType ? 'is-invalid' : ''}`}
              value={newItem.itemType}
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
                value={newItem.stockQuantity}
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
                value={newItem.unit}
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
              value={newItem.manufactureDate}
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
              value={newItem.expiryDate}
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
              value={newItem.itemDescription}
              onChange={handleInputChange}
              placeholder="Nhập mô tả về vật phẩm..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Trạng thái (tự động):</label>
            <div className="auto-status-display">
              <span className={`status ${statusClass}`}>
                {currentStatus}
              </span>
              <small className="status-help-text">
                Trạng thái được tính tự động dựa vào số lượng
                {newItem.stockQuantity <= 0 && (
                  <span className="quantity-warning"> - Số lượng phải lớn hơn 0 khi thêm mới!</span>
                )}
              </small>
            </div>
          </div>

          {errors.submit && (
            <div className="alert alert-danger">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang thêm...' : 'Thêm vật phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
