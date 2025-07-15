import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../InventoryMain.css';
import './AddItem.css';
import inventoryService from '../../../../../services/APINurse/inventoryService';

// Custom styles để tránh xung đột Bootstrap
const addItemStyles = `
  /* Add Item Modal - Namespaced Styles */
  .add-item-modal-overlay {
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
  
  .add-item-modal-dialog {
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
    margin: 1rem;
  }
  
  .add-item-modal-content {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }
  
  .add-item-modal-header {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
  }
  
  .add-item-modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
  }
  
  .add-item-btn-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease;
  }
  
  .add-item-btn-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .add-item-modal-body {
    padding: 1.5rem;
    flex: 1;
    overflow-y: auto;
  }
  
  .add-item-form-group {
    margin-bottom: 1rem;
  }
  
  .add-item-form-label {
    display: block;
    margin-bottom: 0.375rem;
    font-weight: 500;
    color: #495057;
    font-size: 0.875rem;
  }
  
  .add-item-form-control {
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
  
  .add-item-form-control:focus {
    border-color: #007bff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  .add-item-form-control.is-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  }
  
  .add-item-alert {
    padding: 0.75rem 1rem;
    margin-top: 0.5rem;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .add-item-alert-danger {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
  }
  
  .add-item-alert-success {
    color: #155724;
    background-color: #d4edda;
    border-color: #c3e6cb;
  }
  
  .add-item-status-badge {
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
  }
  
  .add-item-status-available {
    color: #155724;
    background-color: #d4edda;
  }
  
  .add-item-status-low {
    color: #856404;
    background-color: #fff3cd;
  }
  
  .add-item-status-out {
    color: #721c24;
    background-color: #f8d7da;
  }
  
  .add-item-modal-footer {
    background-color: #f8f9fa;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .add-item-btn {
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
  
  .add-item-btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
  }
  
  .add-item-btn-secondary:hover {
    background-color: #5a6268;
    border-color: #545b62;
  }
  
  .add-item-btn-primary {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
  }
  
  .add-item-btn-primary:hover {
    background-color: #0056b3;
    border-color: #004085;
  }
  
  .add-item-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .add-item-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: add-item-spin 1s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes add-item-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .add-item-row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -0.75rem;
  }
  
  .add-item-col-6 {
    flex: 0 0 50%;
    max-width: 50%;
    padding: 0 0.75rem;
  }
  
  .add-item-col-12 {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 0.75rem;
  }
  
  @media (max-width: 768px) {
    .add-item-col-6 {
      flex: 0 0 100%;
      max-width: 100%;
    }
    
    .add-item-modal-dialog {
      width: 95%;
      margin: 0.5rem;
    }
    
    .add-item-modal-body {
      padding: 1rem;
    }
  }
  
  /* Utility Classes */
  .add-item-me-1 { margin-right: 0.25rem; }
  .add-item-me-2 { margin-right: 0.5rem; }
  .add-item-text-danger { color: #dc3545; }
  .add-item-text-muted { color: #6c757d; }
  .add-item-fw-bold { font-weight: 600; }

  /* Notification Styles */
  .add-item-notification-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 2050 !important;
    animation: fadeIn 0.3s ease-out !important;
  }
  
  .add-item-notification-dialog {
    max-width: 450px !important;
    width: 90% !important;
    margin: 1.75rem auto !important;
    animation: slideIn 0.4s ease-out !important;
  }

  .add-item-notification-content {
    background: white !important;
    border-radius: 1rem !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
    border: none !important;
    overflow: hidden !important;
    position: relative !important;
  }
  
  .add-item-notification-close {
    position: absolute !important;
    top: 1rem !important;
    right: 1rem !important;
    background: transparent !important;
    border: none !important;
    font-size: 1.2rem !important;
    color: #6c757d !important;
    cursor: pointer !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s ease !important;
    z-index: 10 !important;
  }
  
  .add-item-notification-close:hover {
    background: #f8f9fa !important;
    color: #495057 !important;
    transform: scale(1.1) !important;
  }
  
  .add-item-notification-body {
    padding: 2.5rem 2rem 1.5rem 2rem !important;
    text-align: center !important;
  }
  
  .add-item-notification-icon {
    width: 80px !important;
    height: 80px !important;
    border-radius: 50% !important;
    margin: 0 auto 1.5rem auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    animation: iconPulse 0.6s ease-out !important;
  }
  
  .add-item-notification-icon.success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3) !important;
  }
  
  .add-item-notification-icon.error {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3) !important;
  }
  
  .add-item-notification-icon i {
    font-size: 2.5rem !important;
    color: white !important;
  }
  
  .add-item-notification-title {
    color: #2d3436 !important;
    font-weight: 700 !important;
    font-size: 1.5rem !important;
    margin-bottom: 0.75rem !important;
    animation: titleSlide 0.8s ease-out 0.2s both !important;
  }
  
  .add-item-notification-message {
    color: #636e72 !important;
    font-size: 1rem !important;
    line-height: 1.5 !important;
    margin-bottom: 0 !important;
    animation: messageSlide 0.8s ease-out 0.4s both !important;
  }
  
  .add-item-notification-progress {
    position: relative !important;
    height: 4px !important;
    background: #e9ecef !important;
    overflow: hidden !important;
  }
  
  .add-item-notification-progress-bar {
    height: 100% !important;
    transition: width 0.1s linear !important;
    position: relative !important;
  }
  
  .add-item-notification-progress-bar.success {
    background: linear-gradient(90deg, #28a745 0%, #20c997 100%) !important;
  }
  
  .add-item-notification-progress-bar.error {
    background: linear-gradient(90deg, #dc3545 0%, #c82333 100%) !important;
  }
  
  .add-item-notification-timer {
    padding: 0.75rem 1rem !important;
    background: #f8f9fa !important;
    color: #6c757d !important;
    font-size: 0.875rem !important;
    text-align: center !important;
    font-weight: 500 !important;
  }
  
  @keyframes fadeIn {
    0% { opacity: 0 !important; }
    100% { opacity: 1 !important; }
  }
  
  @keyframes slideIn {
    0% {
      opacity: 0 !important;
      transform: translateY(-50px) scale(0.8) !important;
    }
    100% {
      opacity: 1 !important;
      transform: translateY(0) scale(1) !important;
    }
  }
  
  @keyframes iconPulse {
    0% {
      transform: scale(0) rotate(-180deg) !important;
      opacity: 0 !important;
    }
    50% {
      transform: scale(1.2) rotate(-90deg) !important;
      opacity: 0.8 !important;
    }
    100% {
      transform: scale(1) rotate(0deg) !important;
      opacity: 1 !important;
    }
  }
  
  @keyframes titleSlide {
    0% {
      opacity: 0 !important;
      transform: translateY(20px) !important;
    }
    100% {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  }
  
  @keyframes messageSlide {
    0% {
      opacity: 0 !important;
      transform: translateY(15px) !important;
    }
    100% {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  }
  
  @media (max-width: 576px) {
    .add-item-notification-dialog {
      max-width: 350px !important;
      margin: 1rem auto !important;
    }
    
    .add-item-notification-body {
      padding: 2rem 1.5rem 1rem 1.5rem !important;
    }
    
    .add-item-notification-icon {
      width: 70px !important;
      height: 70px !important;
    }
    
    .add-item-notification-icon i {
      font-size: 2rem !important;
    }
    
    .add-item-notification-title {
      font-size: 1.3rem !important;
    }
    
    .add-item-notification-message {
      font-size: 0.9rem !important;
    }
  }
`;

const AddItem = ({ onClose, onAddItem }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(3);
  const [newItem, setNewItem] = useState({
    itemName: '',
    unit: '',
    stockQuantity: '',
    itemType: '',
    expiryDate: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    itemDescription: ''
  });

  // Debounced name check
  useEffect(() => {
    const itemName = newItem.itemName.trim();
    if (!itemName) {
        setErrors(prev => ({ ...prev, itemName: null }));
        return;
    }

    setIsCheckingName(true);
    const handler = setTimeout(async () => {
        try {
            const { exists, message } = await inventoryService.checkItemNameExistence(itemName);
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
    }, 500); // 500ms debounce delay

    return () => {
        clearTimeout(handler);
        setIsCheckingName(false);
    };
  }, [newItem.itemName]);

  // Notification timer effect
  useEffect(() => {
    if (showNotification) {
      setProgress(100);
      setTimeLeft(3);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / 30); // 3 seconds = 30 intervals
          if (newProgress <= 0) {
            clearInterval(interval);
            handleNotificationClose();
            return 0;
          }
          return newProgress;
        });
        
        setTimeLeft(prev => {
          const newTime = prev - 0.1;
          return newTime > 0 ? newTime : 0;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [showNotification]);

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

    if (!newItem.itemName.trim()) newErrors.itemName = "Tên vật phẩm là bắt buộc";
    if (!newItem.itemType.trim()) newErrors.itemType = "Loại vật phẩm là bắt buộc";
    if (!newItem.unit.trim()) newErrors.unit = "Đơn vị là bắt buộc";

    if (newItem.stockQuantity === '' || newItem.stockQuantity <= 0) {
      newErrors.stockQuantity = "Số lượng phải là một số dương";
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

    if (newItem.manufactureDate) {
        const manufactureDate = new Date(newItem.manufactureDate);
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
      parsedValue = value === '' ? '' : parseInt(value, 10);
    }

    setNewItem({
      ...newItem,
      [name]: parsedValue
    });

    // Don't clear the error if it's from the API check
    if (errors[name] && name !== 'itemName') {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform a final, non-debounced check before submitting
    setIsCheckingName(true);
    const finalNameCheck = await inventoryService.checkItemNameExistence(newItem.itemName.trim());
    setIsCheckingName(false);

    const formErrors = validateForm();

    if (finalNameCheck.exists) {
        formErrors.itemName = finalNameCheck.message;
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

    try {
      setLoading(true);

      const itemToAdd = { ...newItem };

      if (itemToAdd.manufactureDate) {
        itemToAdd.manufactureDate = itemToAdd.manufactureDate.split('T')[0];
      }

      if (itemToAdd.expiryDate) {
        itemToAdd.expiryDate = itemToAdd.expiryDate.split('T')[0];
      }

      const result = await onAddItem(itemToAdd);
      
      if (result) {
        // Hiển thị thông báo thành công
        Swal.fire({
          icon: 'success',
          title: 'Thêm vật phẩm thành công!',
          text: `Vật phẩm "${itemToAdd.itemName}" đã được thêm thành công vào kho y tế.`,
        });
      }
      
    } catch (err) {
      console.error("Lỗi khi thêm vật phẩm:", err);
      const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
      
      // Check for specific error messages to provide better feedback
      if (isDuplicateNameError(errorMessage)) {
        Swal.fire({
          icon: 'error',
          title: 'Tên vật phẩm bị trùng!',
          text: 'Vật phẩm với tên này đã tồn tại trong kho. Vui lòng chọn một tên khác.',
        });
        } else {
        Swal.fire({
          icon: 'error',
          title: 'Không thể thêm vật phẩm!',
          text: `Đã có lỗi xảy ra: ${errorMessage}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = getItemStatus(newItem.stockQuantity);

  // Xử lý đóng thông báo
  const handleNotificationClose = () => {
    setShowNotification(false);
    // Nếu là thông báo thành công thì đóng modal
    if (notificationType === 'success') {
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  // Component thông báo inline
  const NotificationModal = () => {
    if (!showNotification) return null;

    return (
      <div className="add-item-notification-overlay">
        <div className="add-item-notification-dialog">
          <div className="add-item-notification-content">
            <button 
              type="button" 
              className="add-item-notification-close"
              onClick={handleNotificationClose}
              aria-label="Close"
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div className="add-item-notification-body">
              <div className={`add-item-notification-icon ${notificationType}`}>
                <i className={notificationType === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle'}></i>
              </div>
              
              <h4 className="add-item-notification-title">
                {notificationTitle}
              </h4>
              
              <p className="add-item-notification-message">
                {notificationMessage}
              </p>
            </div>
            
            <div className="add-item-notification-progress">
              <div 
                className={`add-item-notification-progress-bar ${notificationType}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="add-item-notification-timer">
              <i className="fas fa-clock add-item-me-1"></i>
              Tự động đóng sau {Math.ceil(timeLeft)} giây
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{addItemStyles}</style>
      <div className="add-item-modal-overlay">
        <div className="add-item-modal-dialog">
          <div className="add-item-modal-content">
            {/* Modal Header */}
            <div className="add-item-modal-header">
              <h5 className="add-item-modal-title">
                <i className="fas fa-plus-circle add-item-me-2"></i>
                Thêm vật phẩm mới
              </h5>
              <button 
                type="button" 
                className="add-item-btn-close"
                onClick={onClose}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="add-item-modal-body">
              {showNotification && (
                <div className={`add-item-alert add-item-alert-${notificationType}`}>
                  {notificationMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit} noValidate>
                {/* Tên vật phẩm */}
                <div className="add-item-row">
                  <div className="add-item-col-12">
                    <div className="add-item-form-group">
                      <label htmlFor="itemName" className="add-item-form-label add-item-fw-bold">
                        <i className="fas fa-tag add-item-me-1"></i>
                        Tên vật phẩm <span className="add-item-text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`add-item-form-control ${errors.itemName ? 'is-invalid' : ''}`}
                        id="itemName"
                        name="itemName"
                        value={newItem.itemName}
                        onChange={handleInputChange}
                        placeholder="Nhập tên vật phẩm..."
                        required
                      />
                      {isCheckingName && (
                        <small className="add-item-text-muted" style={{ marginLeft: '0.5rem' }}>
                          <i className="fas fa-spinner fa-spin"></i> Đang kiểm tra...
                        </small>
                      )}
                      {errors.itemName && (
                        <div className="add-item-alert add-item-alert-danger">
                          <i className="fas fa-exclamation-triangle add-item-me-1"></i>
                          {errors.itemName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Loại vật phẩm */}
                <div className="add-item-row">
                  <div className="add-item-col-12">
                    <div className="add-item-form-group">
                      <label htmlFor="itemType" className="add-item-form-label add-item-fw-bold">
                        <i className="fas fa-list add-item-me-1"></i>
                        Loại <span className="add-item-text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`add-item-form-control ${errors.itemType ? 'is-invalid' : ''}`}
                        id="itemType"
                        name="itemType"
                        value={newItem.itemType}
                        onChange={handleInputChange}
                        placeholder="Thuốc, Thiết bị y tế, v.v..."
                        required
                      />
                      {errors.itemType && (
                        <div className="add-item-alert add-item-alert-danger">
                          <i className="fas fa-exclamation-triangle add-item-me-1"></i>
                          {errors.itemType}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Số lượng và Đơn vị */}
                <div className="add-item-row">
                  <div className="add-item-col-6">
                    <div className="add-item-form-group">
                      <label htmlFor="stockQuantity" className="add-item-form-label add-item-fw-bold">
                        <i className="fas fa-boxes add-item-me-1"></i>
                        Số lượng <span className="add-item-text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`add-item-form-control ${errors.stockQuantity ? 'is-invalid' : ''}`}
                        id="stockQuantity"
                        name="stockQuantity"
                        value={newItem.stockQuantity}
                        onChange={handleInputChange}
                        min="1"
                        max="10000"
                        placeholder="Nhập số lượng..."
                        required
                      />
                      {errors.stockQuantity && (
                        <div className="add-item-alert add-item-alert-danger">
                          <i className="fas fa-exclamation-triangle add-item-me-1"></i>
                          {errors.stockQuantity}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="add-item-col-6">
                    <div className="add-item-form-group">
                      <label htmlFor="unit" className="add-item-form-label add-item-fw-bold">
                        <i className="fas fa-ruler add-item-me-1"></i>
                        Đơn vị <span className="add-item-text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`add-item-form-control ${errors.unit ? 'is-invalid' : ''}`}
                        id="unit"
                        name="unit"
                        value={newItem.unit}
                        onChange={handleInputChange}
                        placeholder="hộp, tuýp, cái..."
                        required
                      />
                      {errors.unit && (
                        <div className="add-item-alert add-item-alert-danger">
                          <i className="fas fa-exclamation-triangle add-item-me-1"></i>
                          {errors.unit}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ngày sản xuất và Ngày hết hạn */}
                <div className="add-item-row">
                  <div className="add-item-col-6">
                    <div className="add-item-form-group">
                      <label htmlFor="manufactureDate" className="add-item-form-label add-item-fw-bold">
                        <i className="fas fa-calendar-alt add-item-me-1"></i>
                        Ngày sản xuất
                      </label>
                      <input
                        type="date"
                        className={`add-item-form-control ${errors.manufactureDate ? 'is-invalid' : ''}`}
                        id="manufactureDate"
                        name="manufactureDate"
                        value={newItem.manufactureDate}
                        onChange={handleInputChange}
                      />
                      {errors.manufactureDate && (
                        <div className="add-item-alert add-item-alert-danger">
                          <i className="fas fa-exclamation-triangle add-item-me-1"></i>
                          {errors.manufactureDate}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="add-item-col-6">
                    <div className="add-item-form-group">
                      <label htmlFor="expiryDate" className="add-item-form-label add-item-fw-bold">
                        <i className="fas fa-calendar-times add-item-me-1"></i>
                        Ngày hết hạn
                      </label>
                      <input
                        type="date"
                        className={`add-item-form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
                        id="expiryDate"
                        name="expiryDate"
                        value={newItem.expiryDate}
                        onChange={handleInputChange}
                        placeholder="dd/mm/yyyy"
                      />
                      {errors.expiryDate && (
                        <div className="add-item-alert add-item-alert-danger">
                          <i className="fas fa-exclamation-triangle add-item-me-1"></i>
                          {errors.expiryDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mô tả */}
                <div className="add-item-row">
                  <div className="add-item-col-12">
                    <div className="add-item-form-group">
                      <label htmlFor="itemDescription" className="add-item-form-label add-item-fw-bold">
                        <i className="fas fa-align-left add-item-me-1"></i>
                        Mô tả
                      </label>
                      <textarea
                        className="add-item-form-control"
                        id="itemDescription"
                        name="itemDescription"
                        value={newItem.itemDescription}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Nhập mô tả về vật phẩm..."
                        style={{ resize: 'vertical' }}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Trạng thái tự động */}
                <div className="add-item-row">
                  <div className="add-item-col-12">
                    <div className="add-item-form-group">
                      <label className="add-item-form-label add-item-fw-bold">
                        <i className="fas fa-info-circle add-item-me-1"></i>
                        Trạng thái (tự động):
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span className={`add-item-status-badge ${
                          currentStatus === 'Sẵn có' ? 'add-item-status-available' :
                          currentStatus === 'Sắp hết' ? 'add-item-status-low' :
                          'add-item-status-out'
                        }`}>
                          <i className="fas fa-circle add-item-me-1"></i>
                          {currentStatus}
                        </span>
                        <small className="add-item-text-muted" style={{ marginLeft: '1rem' }}>
                          Trạng thái được tính tự động dựa vào số lượng
                          {newItem.stockQuantity <= 0 && (
                            <span style={{ color: '#ffc107', fontWeight: 'bold' }}> - Số lượng phải lớn hơn 0!</span>
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {errors.submit && (
                  <div className="add-item-row">
                    <div className="add-item-col-12">
                      <div className="add-item-alert add-item-alert-danger" style={{ display: 'flex', alignItems: 'center' }}>
                        <i className="fas fa-exclamation-circle add-item-me-2"></i>
                        <div>{errors.submit}</div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="add-item-modal-footer">
              {/* Nút test thông báo */}
              <button 
                type="button" 
                className="add-item-btn add-item-btn-secondary"
                onClick={() => {
                  setNotificationType('success');
                  setNotificationTitle('Test thông báo thành công!');
                  setNotificationMessage('Đây là thông báo test để kiểm tra giao diện.');
                  setShowNotification(true);
                }}
                style={{ marginRight: 'auto' }}
              >
                <i className="fas fa-bell add-item-me-1"></i>
                Test
              </button>
              
              <button 
                type="button" 
                className="add-item-btn add-item-btn-secondary"
                onClick={onClose}
              >
                <i className="fas fa-times add-item-me-1"></i>
                Hủy
              </button>
              <button 
                type="submit"
                className="add-item-btn add-item-btn-primary"
                onClick={handleSubmit}
                disabled={loading || isCheckingName}
              >
                {loading || isCheckingName ? (
                  <>
                    <div className="add-item-spinner"></div>
                    {loading ? 'Đang thêm...' : 'Đang kiểm tra...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus add-item-me-1"></i>
                    Thêm vật phẩm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Thông báo */}
      <NotificationModal />
    </>
  );
};

export default AddItem;
