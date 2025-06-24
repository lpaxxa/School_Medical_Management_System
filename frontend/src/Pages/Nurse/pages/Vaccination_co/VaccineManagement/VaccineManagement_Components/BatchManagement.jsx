import React, { useState, useEffect } from 'react';
import './BatchManagement.css';
import vaccinationService from '../../../../../../services/vaccinationService';

const BatchManagement = ({ vaccineId, onClose }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [vaccine, setVaccine] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    quantity: '',
    initialQuantity: '',
    supplier: '',
    unitPrice: '',
    location: 'main_storage',
    notes: '',
    status: 'active'
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    if (vaccineId) {
      fetchBatches();
      fetchVaccineDetails();
    }
  }, [vaccineId]);
  
  const fetchVaccineDetails = async () => {
    try {
      const data = await vaccinationService.getVaccineById(vaccineId);
      setVaccine(data);
    } catch (error) {
      console.error('Error fetching vaccine details:', error);
    }
  };
  
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await vaccinationService.getVaccineBatches(vaccineId);
      setBatches(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear the error for this field if any
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.batchNumber) errors.batchNumber = 'Vui lòng nhập số lô';
    if (!formData.manufacturingDate) errors.manufacturingDate = 'Vui lòng nhập ngày sản xuất';
    if (!formData.expiryDate) errors.expiryDate = 'Vui lòng nhập ngày hết hạn';
    if (!formData.quantity) {
      errors.quantity = 'Vui lòng nhập số lượng';
    } else if (isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      errors.quantity = 'Số lượng phải là số dương';
    }
    
    // Compare dates
    const mfgDate = new Date(formData.manufacturingDate);
    const expDate = new Date(formData.expiryDate);
    
    if (mfgDate >= expDate) {
      errors.expiryDate = 'Ngày hết hạn phải sau ngày sản xuất';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Set initialQuantity = quantity for new batches
      const dataToSubmit = {
        ...formData,
        initialQuantity: formData.quantity,
        vaccineId
      };
      
      await vaccinationService.addVaccineBatch(dataToSubmit);
      setShowAddForm(false);
      fetchBatches();
      
      // Reset form
      setFormData({
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        quantity: '',
        initialQuantity: '',
        supplier: '',
        unitPrice: '',
        location: 'main_storage',
        notes: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error adding batch:', error);
      setError('Không thể thêm lô vaccine. Vui lòng thử lại sau.');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  const getBatchStatusClass = (batch) => {
    const today = new Date();
    const expiryDate = new Date(batch.expiryDate);
    
    // Check if expired
    if (today > expiryDate) return 'status-expired';
    
    // Check if low quantity (less than 20% of initial)
    if (batch.quantity < batch.initialQuantity * 0.2) return 'status-low';
    
    // Check if expiring soon (within 30 days)
    const daysUntilExpiry = Math.round((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30) return 'status-expiring-soon';
    
    return '';
  };
  
  return (
    <div className="batch-management">
      <div className="batch-header">
        <h2>
          <i className="fas fa-layer-group"></i> Quản lý lô vaccine
        </h2>
        {vaccine && (
          <div className="vaccine-info">
            <span className="vaccine-code">{vaccine.code}</span>
            <span className="vaccine-name">{vaccine.name}</span>
          </div>
        )}
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="batch-control">
        <div className="batch-summary">
          <div className="summary-item">
            <span className="summary-label">Tổng số lô:</span>
            <span className="summary-value">{batches.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Còn hiệu lực:</span>
            <span className="summary-value">{batches.filter(b => new Date(b.expiryDate) > new Date()).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tổng số liều:</span>
            <span className="summary-value">{batches.reduce((sum, batch) => sum + parseInt(batch.quantity || 0), 0)}</span>
          </div>
        </div>
        
        <button 
          className="btn-add-batch"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-plus"></i>}
          {showAddForm ? 'Đóng biểu mẫu' : 'Thêm lô mới'}
        </button>
      </div>
      
      {showAddForm && (
        <form className="batch-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Số lô<span className="required">*</span></label>
              <input 
                type="text" 
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className={formErrors.batchNumber ? 'error' : ''}
              />
              {formErrors.batchNumber && <span className="error-message">{formErrors.batchNumber}</span>}
            </div>
            
            <div className="form-group">
              <label>Nhà cung cấp</label>
              <input 
                type="text" 
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Ngày sản xuất<span className="required">*</span></label>
              <input 
                type="date" 
                name="manufacturingDate"
                value={formData.manufacturingDate}
                onChange={handleChange}
                className={formErrors.manufacturingDate ? 'error' : ''}
              />
              {formErrors.manufacturingDate && <span className="error-message">{formErrors.manufacturingDate}</span>}
            </div>
            
            <div className="form-group">
              <label>Ngày hết hạn<span className="required">*</span></label>
              <input 
                type="date" 
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={formErrors.expiryDate ? 'error' : ''}
              />
              {formErrors.expiryDate && <span className="error-message">{formErrors.expiryDate}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Số lượng (liều)<span className="required">*</span></label>
              <input 
                type="number" 
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={formErrors.quantity ? 'error' : ''}
              />
              {formErrors.quantity && <span className="error-message">{formErrors.quantity}</span>}
            </div>
            
            <div className="form-group">
              <label>Đơn giá (VND/liều)</label>
              <input 
                type="number" 
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Vị trí lưu trữ</label>
              <select 
                name="location"
                value={formData.location}
                onChange={handleChange}
              >
                <option value="main_storage">Kho chính</option>
                <option value="refrigerator">Tủ lạnh</option>
                <option value="freezer">Tủ đông</option>
                <option value="cabinet">Tủ thuốc</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Trạng thái</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Đang sử dụng</option>
                <option value="reserved">Dự trữ</option>
                <option value="pending">Chờ kiểm định</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-submit">Lưu lô vaccine</button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => setShowAddForm(false)}
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      )}
      
      {loading ? (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div className="error-message batch-error">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      ) : batches.length === 0 ? (
        <div className="no-batches">
          <i className="fas fa-box-open"></i>
          <p>Chưa có lô vaccine nào được thêm</p>
          <p>Thêm lô vaccine mới để quản lý kho vaccine hiệu quả</p>
        </div>
      ) : (
        <div className="batch-list">
          <table>
            <thead>
              <tr>
                <th>Số lô</th>
                <th>Ngày hết hạn</th>
                <th>Số lượng</th>
                <th>Vị trí</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className={getBatchStatusClass(batch)}>
                  <td>{batch.batchNumber}</td>
                  <td>
                    {formatDate(batch.expiryDate)}
                    {new Date(batch.expiryDate) < new Date() && (
                      <span className="expired-tag">Hết hạn</span>
                    )}
                  </td>
                  <td>
                    <div className="quantity-bar">
                      <div 
                        className="quantity-indicator" 
                        style={{
                          width: `${Math.min(100, (batch.quantity / batch.initialQuantity) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <div className="quantity-text">
                      {batch.quantity}/{batch.initialQuantity}
                    </div>
                  </td>
                  <td>
                    {batch.location === 'main_storage' && 'Kho chính'}
                    {batch.location === 'refrigerator' && 'Tủ lạnh'}
                    {batch.location === 'freezer' && 'Tủ đông'}
                    {batch.location === 'cabinet' && 'Tủ thuốc'}
                  </td>
                  <td>
                    {batch.status === 'active' && <span className="status active">Đang sử dụng</span>}
                    {batch.status === 'reserved' && <span className="status reserved">Dự trữ</span>}
                    {batch.status === 'pending' && <span className="status pending">Chờ kiểm định</span>}
                  </td>
                  <td>
                    <button className="action-btn edit-btn">
                      <i className="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
