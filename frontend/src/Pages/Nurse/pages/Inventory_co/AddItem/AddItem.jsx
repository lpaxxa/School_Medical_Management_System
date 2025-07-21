import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../InventoryMain.css';
import './AddItem.css';
import inventoryService from '../../../../../services/APINurse/inventoryService';

// Utility function to format datetime arrays from backend
const formatDateTimeArray = (dateTimeValue) => {
  if (!dateTimeValue) return '';

  try {
    console.log('🔍 formatDateTimeArray input:', dateTimeValue, 'type:', typeof dateTimeValue);

    let date;

    // Handle array format from Java LocalDateTime/LocalDate
    if (Array.isArray(dateTimeValue)) {
      console.log('📅 DateTime array detected:', dateTimeValue);
      if (dateTimeValue.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateTimeValue;
        // Create date with proper month conversion (Java 1-based to JS 0-based)
        date = new Date(year, month - 1, day, hour, minute, second);
        console.log(`📅 Converted array to Date:`, date);
      } else {
        console.warn('❌ Invalid datetime array format:', dateTimeValue);
        return dateTimeValue.toString();
      }
    }
    // Handle string format
    else if (typeof dateTimeValue === 'string') {
      date = new Date(dateTimeValue);
    }
    // Handle Date object
    else if (dateTimeValue instanceof Date) {
      date = dateTimeValue;
    }
    else {
      console.warn('❌ Unknown datetime format:', dateTimeValue);
      return dateTimeValue.toString();
    }

    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('❌ Invalid date created from:', dateTimeValue);
      return dateTimeValue.toString();
    }

    // Format as DD/MM/YYYY HH:mm for display
    const formatted = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log('✅ formatDateTimeArray result:', formatted);
    return formatted;
  } catch (error) {
    console.error('❌ Error formatting datetime array:', error, 'Input:', dateTimeValue);
    return dateTimeValue.toString();
  }
};

// Helper function để kiểm tra lỗi trùng tên
const isDuplicateNameError = (errorMessage) => {
  const duplicatePatterns = [
    'already exists',
    'đã tồn tại',
    'trùng lặp',
    'duplicate',
    'unique constraint',
    'tên vật phẩm bị trùng'
  ];

  return duplicatePatterns.some(pattern =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};



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

    // Lấy ngày hiện tại (chỉ ngày, không có giờ)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validation cho ngày sản xuất
    if (newItem.manufactureDate) {
      const manufactureDate = new Date(newItem.manufactureDate);
      manufactureDate.setHours(0, 0, 0, 0);

      if (manufactureDate > today) {
        newErrors.manufactureDate = "Ngày sản xuất không được nhập trong tương lai, chỉ được nhập trong quá khứ hoặc hôm nay";
      }
    }

    // Validation cho ngày hết hạn
    if (newItem.expiryDate) {
      const expiryDate = new Date(newItem.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        newErrors.expiryDate = "Ngày hết hạn không được nhập trong quá khứ, chỉ được nhập từ hôm nay trở đi";
      }
    }

    // Validation so sánh ngày sản xuất và ngày hết hạn
    if (newItem.expiryDate && newItem.manufactureDate) {
      const expiryDate = new Date(newItem.expiryDate);
      const manufactureDate = new Date(newItem.manufactureDate);
      expiryDate.setHours(0, 0, 0, 0);
      manufactureDate.setHours(0, 0, 0, 0);

      if (expiryDate <= manufactureDate) {
        newErrors.expiryDate = "Ngày hết hạn phải sau ngày sản xuất";
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

    const updatedItem = {
      ...newItem,
      [name]: parsedValue
    };

    setNewItem(updatedItem);

    // Real-time validation cho ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (name === 'manufactureDate' && value) {
      const manufactureDate = new Date(value);
      manufactureDate.setHours(0, 0, 0, 0);

      if (manufactureDate > today) {
        setErrors(prev => ({
          ...prev,
          manufactureDate: "Ngày sản xuất không được nhập trong tương lai, chỉ được nhập trong quá khứ hoặc hôm nay"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          manufactureDate: null
        }));
      }
    }

    if (name === 'expiryDate' && value) {
      const expiryDate = new Date(value);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        setErrors(prev => ({
          ...prev,
          expiryDate: "Ngày hết hạn không được nhập trong quá khứ, chỉ được nhập từ hôm nay trở đi"
        }));
      } else if (updatedItem.manufactureDate) {
        const manufactureDate = new Date(updatedItem.manufactureDate);
        manufactureDate.setHours(0, 0, 0, 0);

        if (expiryDate <= manufactureDate) {
          setErrors(prev => ({
            ...prev,
            expiryDate: "Ngày hết hạn phải sau ngày sản xuất"
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            expiryDate: null
          }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          expiryDate: null
        }));
      }
    }

    // Kiểm tra lại ngày hết hạn khi ngày sản xuất thay đổi
    if (name === 'manufactureDate' && updatedItem.expiryDate) {
      const expiryDate = new Date(updatedItem.expiryDate);
      const manufactureDate = new Date(value);
      expiryDate.setHours(0, 0, 0, 0);
      manufactureDate.setHours(0, 0, 0, 0);

      if (expiryDate <= manufactureDate) {
        setErrors(prev => ({
          ...prev,
          expiryDate: "Ngày hết hạn phải sau ngày sản xuất"
        }));
      } else if (expiryDate >= today) {
        setErrors(prev => ({
          ...prev,
          expiryDate: null
        }));
      }
    }

    // Don't clear the error if it's from the API check
    if (errors[name] && name !== 'itemName' && name !== 'manufactureDate' && name !== 'expiryDate') {
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

      // Debug: Log the result to see if it contains datetime arrays
      console.log('🔍 AddItem result from API:', result);
      if (result && result.createdAt) {
        console.log('🔍 CreatedAt in result:', result.createdAt, 'type:', typeof result.createdAt);
      }
      if (result && result.expiryDate) {
        console.log('🔍 ExpiryDate in result:', result.expiryDate, 'type:', typeof result.expiryDate);
      }
      if (result && result.manufactureDate) {
        console.log('🔍 ManufactureDate in result:', result.manufactureDate, 'type:', typeof result.manufactureDate);
      }

      if (result) {
        // Format datetime information for success message if available
        let additionalInfo = '';
        if (result.createdAt) {
          const formattedCreatedAt = formatDateTimeArray(result.createdAt);
          additionalInfo = `\nNgày tạo: ${formattedCreatedAt}`;
        }

        // Hiển thị thông báo thành công
        Swal.fire({
          icon: 'success',
          title: 'Thêm vật phẩm thành công!',
          text: `Vật phẩm "${itemToAdd.itemName}" đã được thêm thành công vào kho y tế.${additionalInfo}`,
        });
      }
      
    } catch (err) {
      console.error("Lỗi khi thêm vật phẩm:", err);

      // Debug: Log error response to check for datetime arrays
      if (err.response?.data) {
        console.log('🔍 Error response data:', err.response.data);

        // Check if error data contains datetime arrays that need formatting
        const errorData = err.response.data;
        if (errorData && typeof errorData === 'object') {
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key]) && errorData[key].length >= 3) {
              console.log(`🔍 Potential datetime array in error.${key}:`, errorData[key]);
            }
          });
        }
      }

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
      <div className="add-item-modal-overlay">
        <div className="add-item-modal-dialog">
          <div className="add-item-modal-content">
            {/* Modal Header */}
            <div className="add-item-modal-header">
              <h5 className="add-item-modal-title" style={{color: 'white'}}>
                <i className="fas fa-plus-circle add-item-me-2" style={{color: 'white'}}></i>
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
                        max={new Date().toISOString().split('T')[0]} // Không cho phép chọn ngày tương lai
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
                        min={new Date().toISOString().split('T')[0]} // Không cho phép chọn ngày quá khứ
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
