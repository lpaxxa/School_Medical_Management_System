import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './EditItem.css';
import inventoryService from '../../../../../services/APINurse/inventoryService';

// Custom styles để tránh xung đột Bootstrap
const editItemStyles = `
  /* Edit Item Modal - Namespaced Styles */
  .edit-item-modal-overlay {
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
  
  .edit-item-modal-dialog {
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    margin: 1rem;
  }
  
  .edit-item-modal-content {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }
  
  .edit-item-modal-header {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
  }
  
  .edit-item-modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
  }
  
  .edit-item-btn-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease;
  }
  
  .edit-item-btn-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .edit-item-modal-body {
    padding: 1.5rem;
    flex: 1;
    overflow-y: auto;
  }
  
  .edit-item-form-group {
    margin-bottom: 1rem;
  }
  
  .edit-item-form-label {
    display: block;
    margin-bottom: 0.375rem;
    font-weight: 500;
    color: #495057;
    font-size: 0.875rem;
  }
  
  .edit-item-form-control {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    box-sizing: border-box;
  }
  
  .edit-item-form-control:focus {
    border-color: #28a745;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
  }
  
  .edit-item-form-select {
    width: 100%;
    padding: 0.5rem 2.25rem 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    appearance: none;
    box-sizing: border-box;
  }
  
  .edit-item-form-select:focus {
    border-color: #28a745;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
  }
  
  .edit-item-alert {
    padding: 0.75rem 1rem;
    margin-top: 0.5rem;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .edit-item-alert-danger {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
  }
  
  .edit-item-status-indicator {
    margin-top: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
  }
  
  .edit-item-status-available {
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
  }
  
  .edit-item-status-low {
    color: #856404;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
  }
  
  .edit-item-status-out {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
  }
  
  .edit-item-modal-footer {
    background-color: #f8f9fa;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .edit-item-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.5;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .edit-item-btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
  }
  
  .edit-item-btn-secondary:hover {
    background-color: #5a6268;
    border-color: #545b62;
  }
  
  .edit-item-btn-success {
    background-color: #28a745;
    border-color: #28a745;
    color: white;
  }
  
  .edit-item-btn-success:hover {
    background-color: #218838;
    border-color: #1e7e34;
  }
  
  .edit-item-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .edit-item-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: edit-item-spin 1s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes edit-item-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .edit-item-row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -0.75rem;
  }
  
  .edit-item-col-6 {
    flex: 0 0 50%;
    max-width: 50%;
    padding: 0 0.75rem;
  }
  
  .edit-item-col-12 {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 0.75rem;
  }
  
  @media (max-width: 768px) {
    .edit-item-col-6 {
      flex: 0 0 100%;
      max-width: 100%;
    }
    
    .edit-item-modal-dialog {
      width: 95%;
      margin: 0.5rem;
    }
    
    .edit-item-modal-body {
      padding: 1rem;
    }
  }
  
  /* Utility Classes */
  .edit-item-me-1 { margin-right: 0.25rem; }
  .edit-item-me-2 { margin-right: 0.5rem; }
  .edit-item-text-danger { color: #dc3545; }
  .edit-item-text-muted { color: #6c757d; }
`;

// Hàm định dạng ngày từ form input sang định dạng API yêu cầu (yyyy-MM-dd)
const formatDateForApi = (dateString) => {
  if (!dateString) return '';
  
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toISOString().split('T')[0];
  } catch (err) {
    console.error('Lỗi khi định dạng ngày:', err);
    return dateString;
  }
};

// Hàm chuyển đổi từ array/string sang định dạng input date (yyyy-MM-dd)
const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';

  try {
    console.log('🔍 formatDateForInput input:', dateValue, 'type:', typeof dateValue);

    let date;

    // Handle array format from Java LocalDate [year, month, day]
    if (Array.isArray(dateValue)) {
      console.log('📅 Array format detected:', dateValue);
      if (dateValue.length >= 3) {
        const [year, month, day] = dateValue;
        // Create date with proper month conversion (Java 1-based to JS 0-based)
        date = new Date(year, month - 1, day);
        console.log(`📅 Converted array [${year}, ${month}, ${day}] to Date:`, date);
      } else {
        console.warn('❌ Invalid array format:', dateValue);
        return '';
      }
    }
    // Handle string format
    else if (typeof dateValue === 'string') {
      console.log('📝 String format detected:', dateValue);
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        // Already in correct format
        return dateValue;
      } else {
        date = new Date(dateValue);
      }
    }
    // Handle Date object
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    else {
      console.warn('❌ Unknown date format:', dateValue);
      return '';
    }

    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('❌ Invalid date created from:', dateValue);
      return '';
    }

    // Format as YYYY-MM-DD for input[type="date"]
    const formatted = date.toISOString().split('T')[0];
    console.log('✅ formatDateForInput result:', formatted);
    return formatted;
  } catch (error) {
    console.error('❌ Error formatting date for input:', error, 'Input:', dateValue);
    return '';
  }
};

// Component chỉnh sửa vật phẩm
const EditItem = ({ item, onClose, onEditItem }) => {
  const [editedItem, setEditedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCheckingName, setIsCheckingName] = useState(false);

  useEffect(() => {
    if (item) {
      console.log('🔍 EditItem received item:', item);
      console.log('🔍 Original expiryDate:', item.expiryDate, 'type:', typeof item.expiryDate);
      console.log('🔍 Original manufactureDate:', item.manufactureDate, 'type:', typeof item.manufactureDate);

      setEditedItem({
        itemId: item.itemId,
        itemName: item.itemName || item.name || '',
        unit: item.unit || '',
        stockQuantity: item.stockQuantity || item.quantity || 0,
        itemType: item.itemType || item.category || '',
        expiryDate: formatDateForInput(item.expiryDate),
        manufactureDate: formatDateForInput(item.manufactureDate || item.dateAdded),
        itemDescription: item.itemDescription || item.description || ''
      });

      console.log('🔍 Formatted expiryDate for input:', formatDateForInput(item.expiryDate));
      console.log('🔍 Formatted manufactureDate for input:', formatDateForInput(item.manufactureDate || item.dateAdded));
    }
  }, [item]);

  // Debounced name check
  useEffect(() => {
    if (!editedItem || !editedItem.itemName) return;

    const itemName = editedItem.itemName.trim();
    if (itemName === (item.itemName || '').trim()) {
        setErrors(prev => ({ ...prev, itemName: null }));
        return;
    }
    
    if (!itemName) {
        setErrors(prev => ({ ...prev, itemName: "Tên vật phẩm là bắt buộc" }));
        return;
    }

    setIsCheckingName(true);
    const handler = setTimeout(async () => {
        try {
            const { exists, message } = await inventoryService.checkItemNameExistence(itemName, editedItem.itemId);
            if (exists) {
                setErrors(prev => ({ ...prev, itemName: message }));
            } else {
                setErrors(prev => ({ ...prev, itemName: null }));
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, itemName: 'Lỗi khi kiểm tra tên vật phẩm.' }));
        } finally {
            setIsCheckingName(false);
        }
    }, 500);

    return () => {
        clearTimeout(handler);
        setIsCheckingName(false);
    };
  }, [editedItem?.itemName]);


  if (!editedItem) {
    return (
      <>
        <style>{editItemStyles}</style>
        <div className="edit-item-modal-overlay">
          <div className="edit-item-modal-dialog">
            <div className="edit-item-modal-content">
              <div className="edit-item-modal-header">
                <h5 className="edit-item-modal-title">
                  <i className="fas fa-edit edit-item-me-2"></i>
                  Chỉnh sửa vật phẩm
                </h5>
                <button 
                  type="button" 
                  className="edit-item-btn-close"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="edit-item-modal-body">
                <p>Đang tải dữ liệu vật phẩm...</p>
              </div>

              <div className="edit-item-modal-footer">
                <button 
                  type="button" 
                  className="edit-item-btn edit-item-btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  <i className="fas fa-times edit-item-me-1"></i>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  const getItemStatus = (quantity) => {
    const qty = Number(quantity);
    if (qty === 0) {
      return 'Hết hàng';
    } else if (qty <= 20) {
      return 'Sắp hết';
    } else {
      return 'Sẵn có';
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!editedItem.itemName.trim()) {
      newErrors.itemName = 'Tên vật phẩm là bắt buộc';
    }
    
    if (!editedItem.itemType.trim()) {
      newErrors.itemType = 'Loại vật phẩm là bắt buộc';
    }
    
    if (!editedItem.unit.trim()) {
      newErrors.unit = 'Đơn vị là bắt buộc';
    }
    
    if (editedItem.stockQuantity < 0) {
      newErrors.stockQuantity = 'Số lượng không được âm';
    } else if (editedItem.stockQuantity > 10000) {
      newErrors.stockQuantity = "Số lượng không được vượt quá 10000";
    }

    if (editedItem.expiryDate && editedItem.manufactureDate) {
      const expiryDate = new Date(editedItem.expiryDate);
      const manufactureDate = new Date(editedItem.manufactureDate);
      if (expiryDate < manufactureDate) {
        newErrors.expiryDate = "Ngày hết hạn không được trước ngày sản xuất";
      }
    }

    if (editedItem.manufactureDate) {
        const manufactureDate = new Date(editedItem.manufactureDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        if (manufactureDate > today) {
            newErrors.manufactureDate = "Ngày sản xuất không được ở tương lai";
        }
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    if (name === 'stockQuantity') {
        parsedValue = value === '' ? 0 : parseInt(value, 10);
    }

    setEditedItem(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    if (errors[name] && name !== 'itemName') {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final name check before submitting
    let formErrors = validateForm();
    const itemName = editedItem.itemName.trim();

    if (itemName && itemName !== (item.itemName || '').trim()) {
        setIsCheckingName(true);
        const finalNameCheck = await inventoryService.checkItemNameExistence(itemName, editedItem.itemId);
        setIsCheckingName(false);
        
        if (finalNameCheck.exists) {
            formErrors.itemName = finalNameCheck.message;
        }
    }
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      Swal.fire({
        icon: 'warning',
        title: 'Dữ liệu không hợp lệ',
        html: `Vui lòng kiểm tra lại các trường sau:<br/>${Object.values(formErrors).join('<br/>')}`,
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const dataToSubmit = {
        ...editedItem,
        stockQuantity: Number(editedItem.stockQuantity),
        manufactureDate: formatDateForApi(editedItem.manufactureDate),
        expiryDate: formatDateForApi(editedItem.expiryDate)
      };
      
      console.log('Submitting edited item:', dataToSubmit);
      
      await onEditItem(dataToSubmit);
      
      Swal.fire({
        icon: 'success',
        title: 'Cập nhật thành công!',
        text: `Vật phẩm "${editedItem.itemName}" đã được cập nhật.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật vật phẩm:", err);
      const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
      
      if (errorMessage.toLowerCase().includes("duplicate")) {
        Swal.fire('Lỗi!', 'Tên vật phẩm đã tồn tại. Vui lòng chọn tên khác.', 'error');
      } else {
        Swal.fire('Lỗi!', `Không thể cập nhật vật phẩm: ${errorMessage}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = editedItem.stockQuantity !== '' ? getItemStatus(editedItem.stockQuantity) : '';
  
  const statusClass = 
    currentStatus === 'Sẵn có' ? 'available' : 
    currentStatus === 'Sắp hết' ? 'low' : 
    currentStatus === 'Hết hàng' ? 'out' : '';

  return (
    <>
      <style>{editItemStyles}</style>
      <div className="edit-item-modal-overlay">
        <div className="edit-item-modal-dialog">
          <div className="edit-item-modal-content">
            <div className="edit-item-modal-header">
              <h5 className="edit-item-modal-title">
                <i className="fas fa-edit edit-item-me-2"></i>
                Chỉnh sửa vật phẩm
              </h5>
              <button 
                type="button" 
                className="edit-item-btn-close"
                onClick={onClose}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="edit-item-modal-body">
              <form onSubmit={handleSubmit}>
                <div className="edit-item-row">
                  <div className="edit-item-col-12">
                    <div className="edit-item-form-group">
                      <label htmlFor="itemName" className="edit-item-form-label">
                        <i className="fas fa-tag edit-item-me-1"></i>
                        Tên vật phẩm <span className="edit-item-text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="edit-item-form-control"
                        id="itemName"
                        name="itemName"
                        value={editedItem.itemName}
                        onChange={handleInputChange}
                        placeholder="Nhập tên vật phẩm..."
                        required
                      />
                      {isCheckingName && (
                        <small className="edit-item-text-muted" style={{ marginLeft: '0.5rem' }}>
                          <i className="fas fa-spinner fa-spin"></i> Đang kiểm tra...
                        </small>
                      )}
                      {errors.itemName && (
                        <div className="edit-item-alert edit-item-alert-danger">
                          <i className="fas fa-exclamation-triangle edit-item-me-1"></i>
                          {errors.itemName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="edit-item-row">
                  <div className="edit-item-col-6">
                    <div className="edit-item-form-group">
                      <label htmlFor="itemType" className="edit-item-form-label">
                        <i className="fas fa-list edit-item-me-1"></i>
                        Loại vật phẩm <span className="edit-item-text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="edit-item-form-control"
                        id="itemType"
                        name="itemType"
                        value={editedItem.itemType}
                        onChange={handleInputChange}
                        placeholder="Nhập loại vật phẩm (VD: Thuốc, Vật tư y tế, Thiết bị...)"
                        required
                      />
                      {errors.itemType && (
                        <div className="edit-item-alert edit-item-alert-danger">
                          <i className="fas fa-exclamation-triangle edit-item-me-1"></i>
                          {errors.itemType}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="edit-item-col-6">
                    <div className="edit-item-form-group">
                      <label htmlFor="unit" className="edit-item-form-label">
                        <i className="fas fa-ruler edit-item-me-1"></i>
                        Đơn vị <span className="edit-item-text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="edit-item-form-control"
                        id="unit"
                        name="unit"
                        value={editedItem.unit}
                        onChange={handleInputChange}
                        placeholder="VD: Hộp, Chai, Cái..."
                        required
                      />
                      {errors.unit && (
                        <div className="edit-item-alert edit-item-alert-danger">
                          <i className="fas fa-exclamation-triangle edit-item-me-1"></i>
                          {errors.unit}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="edit-item-row">
                  <div className="edit-item-col-6">
                    <div className="edit-item-form-group">
                      <label htmlFor="stockQuantity" className="edit-item-form-label">
                        <i className="fas fa-cubes edit-item-me-1"></i>
                        Số lượng tồn kho <span className="edit-item-text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="edit-item-form-control"
                        id="stockQuantity"
                        name="stockQuantity"
                        value={editedItem.stockQuantity}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                      {errors.stockQuantity && (
                        <div className="edit-item-alert edit-item-alert-danger">
                          <i className="fas fa-exclamation-triangle edit-item-me-1"></i>
                          {errors.stockQuantity}
                        </div>
                      )}
                      {currentStatus && (
                        <div className={`edit-item-status-indicator edit-item-status-${statusClass}`}>
                          <i className="fas fa-info-circle edit-item-me-1"></i>
                          Trạng thái: {currentStatus}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="edit-item-row">
                  <div className="edit-item-col-6">
                    <div className="edit-item-form-group">
                      <label htmlFor="manufactureDate" className="edit-item-form-label">
                        <i className="fas fa-industry edit-item-me-1"></i>
                        Ngày sản xuất
                      </label>
                      <input
                        type="date"
                        className="edit-item-form-control"
                        id="manufactureDate"
                        name="manufactureDate"
                        value={editedItem.manufactureDate}
                        onChange={handleInputChange}
                      />
                      {errors.manufactureDate && (
                        <div className="edit-item-alert edit-item-alert-danger">
                          <i className="fas fa-exclamation-triangle edit-item-me-1"></i>
                          {errors.manufactureDate}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="edit-item-col-6">
                    <div className="edit-item-form-group">
                      <label htmlFor="expiryDate" className="edit-item-form-label">
                        <i className="fas fa-calendar-times edit-item-me-1"></i>
                        Ngày hết hạn
                      </label>
                      <input
                        type="date"
                        className="edit-item-form-control"
                        id="expiryDate"
                        name="expiryDate"
                        value={editedItem.expiryDate}
                        onChange={handleInputChange}
                      />
                      {errors.expiryDate && (
                        <div className="edit-item-alert edit-item-alert-danger">
                          <i className="fas fa-exclamation-triangle edit-item-me-1"></i>
                          {errors.expiryDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="edit-item-row">
                  <div className="edit-item-col-12">
                    <div className="edit-item-form-group">
                      <label htmlFor="itemDescription" className="edit-item-form-label">
                        <i className="fas fa-align-left edit-item-me-1"></i>
                        Mô tả
                      </label>
                      <textarea
                        className="edit-item-form-control"
                        id="itemDescription"
                        name="itemDescription"
                        value={editedItem.itemDescription}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Nhập mô tả chi tiết về vật phẩm..."
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="edit-item-modal-footer">
              <button 
                type="button" 
                className="edit-item-btn edit-item-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                <i className="fas fa-times edit-item-me-1"></i>
                Hủy
              </button>
              <button 
                type="submit"
                className="edit-item-btn edit-item-btn-success"
                onClick={handleSubmit}
                disabled={loading || isCheckingName}
              >
                {loading || isCheckingName ? (
                  <>
                    <div className="edit-item-spinner"></div>
                    {loading ? 'Đang lưu...' : 'Đang kiểm tra...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save edit-item-me-1"></i>
                    Lưu thay đổi
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

export default EditItem;
