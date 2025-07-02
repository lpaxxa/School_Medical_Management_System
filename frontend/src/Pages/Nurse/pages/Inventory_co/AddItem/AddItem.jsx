import React, { useState, useEffect } from 'react';
import '../InventoryMain.css';
import './AddItem.css';
import inventoryService from '../../../../../services/APINurse/inventoryService';
import { toast } from 'react-toastify';

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
      toast.success('Thêm vật phẩm thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
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

        toast.error(`Lỗi: ${message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        setErrors(prev => ({
          ...prev,
          submit: message
        }));
        toast.error(`Lỗi: ${message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = getItemStatus(newItem.stockQuantity);

  return (
    <>
      {/* Bootstrap Modal Backdrop */}
      <div 
        className="modal fade show" 
        style={{ display: 'block' }} 
        tabIndex="-1" 
        role="dialog"
        aria-labelledby="addItemModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content shadow-lg">
            {/* Modal Header */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="addItemModal">
                <i className="fas fa-plus-circle me-2"></i>
                Thêm vật phẩm mới
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
              <form id="addItemForm" onSubmit={handleSubmit}>
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
                        value={newItem.itemName}
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
                        value={newItem.itemType}
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
                        value={newItem.stockQuantity}
                        onChange={handleInputChange}
                        min="0"
                        max="10000"
                        placeholder="0"
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
                        value={newItem.unit}
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
                        value={newItem.manufactureDate}
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
                        value={newItem.expiryDate}
                        onChange={handleInputChange}
                        placeholder="dd/mm/yyyy"
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
                        value={newItem.itemDescription}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Nhập mô tả về vật phẩm..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Trạng thái tự động */}
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
                          {newItem.stockQuantity <= 0 && (
                            <span className="text-warning fw-bold"> - Số lượng phải lớn hơn 0!</span>
                          )}
                        </small>
                      </div>
                    </div>
                  </div>

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
                form="addItemForm"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-1"></i>
                    Thêm vật phẩm
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

export default AddItem;
