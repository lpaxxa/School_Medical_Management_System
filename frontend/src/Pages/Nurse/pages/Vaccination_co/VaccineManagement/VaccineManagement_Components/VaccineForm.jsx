import React, { useState, useEffect } from 'react';
import './VaccineForm.css';

const VaccineForm = ({ vaccine, onSubmit, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    manufacturer: '',
    description: '',
    dosage: '',
    administrationMethod: 'Tiêm bắp',
    ageGroup: 'all',
    mandatory: false,
    status: 'active',
    sideEffects: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vaccine && mode === 'edit') {
      setFormData({ ...vaccine });
    }
  }, [vaccine, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code) newErrors.code = 'Vui lòng nhập mã vaccine';
    if (!formData.name) newErrors.name = 'Vui lòng nhập tên vaccine';
    if (!formData.manufacturer) newErrors.manufacturer = 'Vui lòng nhập nhà sản xuất';
    if (!formData.dosage) newErrors.dosage = 'Vui lòng nhập liều lượng';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Reset form if adding
      if (mode === 'add') {
        setFormData({
          code: '',
          name: '',
          manufacturer: '',
          description: '',
          dosage: '',
          administrationMethod: 'Tiêm bắp',
          ageGroup: 'all',
          mandatory: false,
          status: 'active',
          sideEffects: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error submitting vaccine form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="vaccine-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="code">Mã vaccine<span className="required">*</span></label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={errors.code ? 'error' : ''}
            disabled={mode === 'edit'} // Không cho phép sửa mã trong chế độ edit
          />
          {errors.code && <span className="error-message">{errors.code}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="name">Tên vaccine<span className="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="manufacturer">Nhà sản xuất<span className="required">*</span></label>
          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            className={errors.manufacturer ? 'error' : ''}
          />
          {errors.manufacturer && <span className="error-message">{errors.manufacturer}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="dosage">Liều lượng<span className="required">*</span></label>
          <input
            type="text"
            id="dosage"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            className={errors.dosage ? 'error' : ''}
          />
          {errors.dosage && <span className="error-message">{errors.dosage}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="administrationMethod">Phương thức tiêm</label>
          <select
            id="administrationMethod"
            name="administrationMethod"
            value={formData.administrationMethod}
            onChange={handleChange}
          >
            <option value="Tiêm bắp">Tiêm bắp</option>
            <option value="Tiêm dưới da">Tiêm dưới da</option>
            <option value="Tiêm tĩnh mạch">Tiêm tĩnh mạch</option>
            <option value="Uống">Uống</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="ageGroup">Nhóm tuổi</label>
          <select
            id="ageGroup"
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleChange}
          >
            <option value="all">Tất cả</option>
            <option value="0-1">0-1 tuổi</option>
            <option value="1-5">1-5 tuổi</option>
            <option value="5-10">5-10 tuổi</option>
            <option value="10-15">10-15 tuổi</option>
            <option value="15+">15+ tuổi</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Trạng thái</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Đang sử dụng</option>
            <option value="inactive">Ngưng sử dụng</option>
            <option value="pending">Chờ phê duyệt</option>
          </select>
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="mandatory"
            name="mandatory"
            checked={formData.mandatory}
            onChange={handleChange}
          />
          <label htmlFor="mandatory">Bắt buộc</label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Mô tả</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="sideEffects">Tác dụng phụ</label>
        <textarea
          id="sideEffects"
          name="sideEffects"
          value={formData.sideEffects}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Ghi chú</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="2"
        ></textarea>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : mode === 'add' ? 'Thêm vaccine' : 'Cập nhật'}
        </button>
      </div>
    </form>
  );
};

export default VaccineForm;
