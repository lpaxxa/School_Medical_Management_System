import React, { useState, useEffect } from 'react';
import inventoryService from '../../../../../services/APINurse/inventoryService';
import './ViewDetails.css';

const ViewDetailsItem = ({ itemId, onClose, show }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch item details when modal opens
  useEffect(() => {
    if (show && itemId) {
      fetchItemDetails();
    }
  }, [show, itemId]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getItemById(itemId);
      if (response) {
        setItem(response);
      } else {
        setError('Không tìm thấy thông tin vật tư y tế');
      }
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Lỗi khi tải thông tin chi tiết vật tư y tế');
    } finally {
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    
    try {
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = new Date(dateString + 'T00:00:00');
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (quantity) => {
    const qty = quantity !== undefined && quantity !== null ? Number(quantity) : 0;
    
    if (qty === 0) {
      return <span className="vtu-status-badge vtu-status-danger"><i className="fas fa-circle me-1" style={{ fontSize: '0.6rem' }}></i>Hết hàng</span>;
    } else if (qty <= 20) {
      return <span className="vtu-status-badge vtu-status-warning"><i className="fas fa-circle me-1" style={{ fontSize: '0.6rem' }}></i>Sắp hết</span>;
    } else {
      return <span className="vtu-status-badge vtu-status-success"><i className="fas fa-circle me-1" style={{ fontSize: '0.6rem' }}></i>Sẵn có</span>;
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (itemType) => {
    switch (itemType?.toLowerCase()) {
      case 'medicine':
        return 'vtu-type-primary';
      case 'supplies':
        return 'vtu-type-secondary';
      case 'equipment':
        return 'vtu-type-info';
      default:
        return 'vtu-type-secondary';
    }
  };

  return (
    <div className={`vtu-modal-overlay ${show ? 'vtu-modal-show' : ''}`} onClick={onClose}>
      <div className="vtu-modal-dialog vtu-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="vtu-modal-content">
          <div className="vtu-modal-header">
            <h5 className="vtu-modal-title">
              <i className="fas fa-info-circle me-2"></i>
              Chi tiết vật tư y tế
            </h5>
            <button type="button" className="vtu-btn-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="vtu-modal-body">
            {loading && (
              <div className="vtu-loading-container">
                <div className="vtu-spinner"></div>
                <span className="vtu-loading-text">Đang tải thông tin...</span>
              </div>
            )}

            {error && (
              <div className="vtu-alert vtu-alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {item && !loading && (
              <div className="vtu-content-grid">
                {/* Basic Information */}
                <div className="vtu-info-section">
                  <div className="vtu-info-card">
                    <div className="vtu-card-header">
                      <h6 className="vtu-card-title">
                        <i className="fas fa-clipboard-list me-2"></i>
                        Thông tin cơ bản
                      </h6>
                    </div>
                    <div className="vtu-card-body">
                      <div className="vtu-row">
                        <div className="vtu-col-6">
                          <div className="vtu-field-container">
                            <div className="vtu-field-label">
                              <i className="fas fa-hashtag text-muted me-2"></i>
                              <strong>ID:</strong>
                            </div>
                            <div className="vtu-field-value">
                              <span className="vtu-badge vtu-badge-primary">{item.itemId}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="vtu-col-6">
                          <div className="vtu-field-container">
                            <div className="vtu-field-label">
                              <i className="fas fa-tag text-muted me-2"></i>
                              <strong>Tên vật phẩm:</strong>
                            </div>
                            <div className="vtu-field-value">
                              <span className="vtu-field-text">{item.itemName}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="vtu-col-6">
                          <div className="vtu-field-container">
                            <div className="vtu-field-label">
                              <i className="fas fa-list text-muted me-2"></i>
                              <strong>Loại:</strong>
                            </div>
                            <div className="vtu-field-value">
                              <span className={`vtu-type-badge ${getTypeBadgeColor(item.itemType)}`}>
                                {item.itemType}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="vtu-col-6">
                          <div className="vtu-field-container">
                            <div className="vtu-field-label">
                              <i className="fas fa-ruler text-muted me-2"></i>
                              <strong>Đơn vị:</strong>
                            </div>
                            <div className="vtu-field-value">
                              <span className="vtu-field-text">{item.unit}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="vtu-info-section">
                  <div className="vtu-info-card">
                    <div className="vtu-card-header">
                      <h6 className="vtu-card-title">
                        <i className="fas fa-boxes me-2"></i>
                        Thông tin tồn kho
                      </h6>
                    </div>
                    <div className="vtu-card-body">
                      <div className="vtu-row">
                        <div className="vtu-col-6">
                          <div className="vtu-field-container">
                            <div className="vtu-field-label">
                              <i className="fas fa-cubes text-muted me-2"></i>
                              <strong>Số lượng tồn kho:</strong>
                            </div>
                            <div className="vtu-field-value">
                              <span className="vtu-quantity-text">{item.stockQuantity}</span>
                              <span className="vtu-unit-text">{item.unit}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="vtu-col-6">
                          <div className="vtu-field-container">
                            <div className="vtu-field-label">
                              <i className="fas fa-info-circle text-muted me-2"></i>
                              <strong>Trạng thái:</strong>
                            </div>
                            <div className="vtu-field-value">
                              {getStatusBadge(item.stockQuantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Information */}
                <div className="vtu-info-section">
                  <div className="vtu-info-card">
                    <div className="vtu-card-header">
                      <h6 className="vtu-card-title">
                        <i className="fas fa-calendar-alt me-2"></i>
                        Thông tin ngày tháng
                      </h6>
                    </div>
                    <div className="vtu-card-body">
                      <div className="vtu-row">
                        <div className="vtu-col-4">
                          <div className="vtu-field-container">
                            <div className="vtu-field-label">
                              <i className="fas fa-industry text-muted me-2"></i>
                              <strong>Ngày sản xuất:</strong>
                            </div>
                            <div className="vtu-field-value">
                              <span className="vtu-field-text">{formatDate(item.manufactureDate)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="vtu-col-4">
                          <div className="vtu-field-container">
                            <div className="vtu-field-label">
                              <i className="fas fa-calendar-times text-muted me-2"></i>
                              <strong>Ngày hết hạn:</strong>
                            </div>
                            <div className="vtu-field-value">
                              <span className="vtu-field-text">{formatDate(item.expiryDate)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="vtu-col-4">
                          <div className="vtu-field-container">
                            <div className="vtu-field-label">
                              <i className="fas fa-plus-circle text-muted me-2"></i>
                              <strong>Ngày tạo:</strong>
                            </div>
                            <div className="vtu-field-value">
                              <span className="vtu-field-text">{formatDate(item.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {item.itemDescription && (
                  <div className="vtu-info-section">
                    <div className="vtu-info-card">
                      <div className="vtu-card-header">
                        <h6 className="vtu-card-title">
                          <i className="fas fa-align-left me-2"></i>
                          Mô tả chi tiết
                        </h6>
                      </div>
                      <div className="vtu-card-body">
                        <p className="vtu-description-text">{item.itemDescription}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="vtu-modal-footer">
            <button className="vtu-btn vtu-btn-secondary" onClick={onClose}>
              <i className="fas fa-times me-2"></i>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsItem;
