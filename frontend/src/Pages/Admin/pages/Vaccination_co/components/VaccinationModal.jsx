import React, { useState, useEffect } from 'react';
import './VaccinationModal.css';

const VaccinationModal = ({ isOpen, onClose, onSave, vaccination, isEditMode }) => {
  const initialFormData = {
    tenVaccine: '',
    nhaCanXuat: '',
    soLo: '',
    hanSuDung: '',
    soLuong: '',
    doiTuong: '',
    trangThai: 'Đang sử dụng',
    ngayNhap: new Date().toISOString().split('T')[0],
    nguoiNhap: '',
    ghiChu: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Initialize form data if in edit mode
  useEffect(() => {
    if (isEditMode && vaccination) {
      setFormData({
        tenVaccine: vaccination.tenVaccine || '',
        nhaCanXuat: vaccination.nhaCanXuat || '',
        soLo: vaccination.soLo || '',
        hanSuDung: vaccination.hanSuDung || '',
        soLuong: vaccination.soLuong || '',
        doiTuong: vaccination.doiTuong || '',
        trangThai: vaccination.trangThai || 'Đang sử dụng',
        ngayNhap: vaccination.ngayNhap || new Date().toISOString().split('T')[0],
        nguoiNhap: vaccination.nguoiNhap || '',
        ghiChu: vaccination.ghiChu || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isEditMode, vaccination]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.tenVaccine.trim()) {
      newErrors.tenVaccine = 'Vui lòng nhập tên vắc xin';
    }
    
    if (!formData.nhaCanXuat.trim()) {
      newErrors.nhaCanXuat = 'Vui lòng nhập nhà cung cấp';
    }
    
    if (!formData.soLo.trim()) {
      newErrors.soLo = 'Vui lòng nhập số lô';
    }
    
    if (!formData.hanSuDung) {
      newErrors.hanSuDung = 'Vui lòng nhập hạn sử dụng';
    }
    
    if (!formData.soLuong || isNaN(formData.soLuong) || parseInt(formData.soLuong) <= 0) {
      newErrors.soLuong = 'Vui lòng nhập số lượng hợp lệ';
    }
    
    if (!formData.doiTuong.trim()) {
      newErrors.doiTuong = 'Vui lòng nhập đối tượng';
    }
    
    if (!formData.trangThai) {
      newErrors.trangThai = 'Vui lòng chọn trạng thái';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert numeric fields
      const preparedData = {
        ...formData,
        soLuong: parseInt(formData.soLuong)
      };
      
      onSave(preparedData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Chỉnh sửa thông tin tiêm chủng' : 'Thêm mới thông tin tiêm chủng'}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <form className="vaccination-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tenVaccine">Tên vắc xin <span className="required-star">*</span></label>
                <input
                  type="text"
                  id="tenVaccine"
                  name="tenVaccine"
                  value={formData.tenVaccine}
                  onChange={handleChange}
                  placeholder="Nhập tên vắc xin"
                  className={errors.tenVaccine ? 'error' : ''}
                />
                {errors.tenVaccine && <div className="error-message">{errors.tenVaccine}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="nhaCanXuat">Nhà cung cấp <span className="required-star">*</span></label>
                <input
                  type="text"
                  id="nhaCanXuat"
                  name="nhaCanXuat"
                  value={formData.nhaCanXuat}
                  onChange={handleChange}
                  placeholder="Nhập tên nhà cung cấp"
                  className={errors.nhaCanXuat ? 'error' : ''}
                />
                {errors.nhaCanXuat && <div className="error-message">{errors.nhaCanXuat}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="soLo">Số lô <span className="required-star">*</span></label>
                <input
                  type="text"
                  id="soLo"
                  name="soLo"
                  value={formData.soLo}
                  onChange={handleChange}
                  placeholder="Nhập số lô"
                  className={errors.soLo ? 'error' : ''}
                />
                {errors.soLo && <div className="error-message">{errors.soLo}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="hanSuDung">Hạn sử dụng <span className="required-star">*</span></label>
                <input
                  type="date"
                  id="hanSuDung"
                  name="hanSuDung"
                  value={formData.hanSuDung}
                  onChange={handleChange}
                  className={errors.hanSuDung ? 'error' : ''}
                />
                {errors.hanSuDung && <div className="error-message">{errors.hanSuDung}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="soLuong">Số lượng <span className="required-star">*</span></label>
                <input
                  type="number"
                  id="soLuong"
                  name="soLuong"
                  value={formData.soLuong}
                  onChange={handleChange}
                  placeholder="Nhập số lượng"
                  min="1"
                  className={errors.soLuong ? 'error' : ''}
                />
                {errors.soLuong && <div className="error-message">{errors.soLuong}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="trangThai">Trạng thái <span className="required-star">*</span></label>
                <select
                  id="trangThai"
                  name="trangThai"
                  value={formData.trangThai}
                  onChange={handleChange}
                  className={errors.trangThai ? 'error' : ''}
                >
                  <option value="Đang sử dụng">Đang sử dụng</option>
                  <option value="Sắp hết hàng">Sắp hết hàng</option>
                  <option value="Hết hạn">Hết hạn</option>
                  <option value="Ngừng sử dụng">Ngừng sử dụng</option>
                </select>
                {errors.trangThai && <div className="error-message">{errors.trangThai}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="doiTuong">Đối tượng <span className="required-star">*</span></label>
                <input
                  type="text"
                  id="doiTuong"
                  name="doiTuong"
                  value={formData.doiTuong}
                  onChange={handleChange}
                  placeholder="Nhập đối tượng sử dụng"
                  className={errors.doiTuong ? 'error' : ''}
                />
                {errors.doiTuong && <div className="error-message">{errors.doiTuong}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="nguoiNhap">Người nhập</label>
                <input
                  type="text"
                  id="nguoiNhap"
                  name="nguoiNhap"
                  value={formData.nguoiNhap}
                  onChange={handleChange}
                  placeholder="Nhập tên người nhập vắc xin"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="ghiChu">Ghi chú</label>
              <textarea
                id="ghiChu"
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleChange}
                placeholder="Nhập ghi chú (không bắt buộc)"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Huỷ bỏ
              </button>
              <button type="submit" className="btn-submit">
                {isEditMode ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VaccinationModal;
