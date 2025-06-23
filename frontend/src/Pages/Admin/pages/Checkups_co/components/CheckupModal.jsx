import React, { useState, useEffect } from 'react';
import './CheckupModal.css';

const CheckupModal = ({ isOpen, onClose, onSave, checkup, isEditMode }) => {
  const initialFormData = {
    tenDotKham: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    doiTuong: '',
    nguoiPhuTrach: '',
    trangThai: 'Chưa bắt đầu',
    soLuongHocSinh: '',
    daKham: 0,
    ghiChu: ''
  };S

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Initialize form data if in edit mode
  useEffect(() => {
    if (isEditMode && checkup) {
      setFormData({
        tenDotKham: checkup.tenDotKham || '',
        ngayBatDau: checkup.ngayBatDau || '',
        ngayKetThuc: checkup.ngayKetThuc || '',
        doiTuong: checkup.doiTuong || '',
        nguoiPhuTrach: checkup.nguoiPhuTrach || '',
        trangThai: checkup.trangThai || 'Chưa bắt đầu',
        soLuongHocSinh: checkup.soLuongHocSinh || '',
        daKham: checkup.daKham || 0,
        ghiChu: checkup.ghiChu || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isEditMode, checkup]);

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
    
    if (!formData.tenDotKham.trim()) {
      newErrors.tenDotKham = 'Vui lòng nhập tên đợt kiểm tra';
    }
    
    if (!formData.ngayBatDau) {
      newErrors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
    }
    
    if (!formData.ngayKetThuc) {
      newErrors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
    } else if (formData.ngayBatDau && new Date(formData.ngayKetThuc) < new Date(formData.ngayBatDau)) {
      newErrors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    if (!formData.doiTuong.trim()) {
      newErrors.doiTuong = 'Vui lòng nhập đối tượng';
    }
    
    if (!formData.nguoiPhuTrach.trim()) {
      newErrors.nguoiPhuTrach = 'Vui lòng nhập người phụ trách';
    }
    
    if (!formData.trangThai) {
      newErrors.trangThai = 'Vui lòng chọn trạng thái';
    }
    
    if (!formData.soLuongHocSinh || isNaN(formData.soLuongHocSinh) || parseInt(formData.soLuongHocSinh) <= 0) {
      newErrors.soLuongHocSinh = 'Vui lòng nhập số lượng học sinh hợp lệ';
    }
    
    if (formData.daKham && (isNaN(formData.daKham) || parseInt(formData.daKham) < 0)) {
      newErrors.daKham = 'Số học sinh đã khám không hợp lệ';
    }

    if (parseInt(formData.daKham) > parseInt(formData.soLuongHocSinh)) {
      newErrors.daKham = 'Số học sinh đã khám không thể lớn hơn tổng số học sinh';
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
        soLuongHocSinh: parseInt(formData.soLuongHocSinh),
        daKham: parseInt(formData.daKham || 0)
      };
      
      onSave(preparedData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Chỉnh sửa đợt kiểm tra sức khỏe' : 'Thêm mới đợt kiểm tra sức khỏe'}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <form className="checkup-form" onSubmit={handleSubmit}>
            <div className="form-group full-width">
              <label htmlFor="tenDotKham">Tên đợt kiểm tra <span className="required-star">*</span></label>
              <input
                type="text"
                id="tenDotKham"
                name="tenDotKham"
                value={formData.tenDotKham}
                onChange={handleChange}
                placeholder="Nhập tên đợt kiểm tra sức khỏe"
                className={errors.tenDotKham ? 'error' : ''}
              />
              {errors.tenDotKham && <div className="error-message">{errors.tenDotKham}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ngayBatDau">Ngày bắt đầu <span className="required-star">*</span></label>
                <input
                  type="date"
                  id="ngayBatDau"
                  name="ngayBatDau"
                  value={formData.ngayBatDau}
                  onChange={handleChange}
                  className={errors.ngayBatDau ? 'error' : ''}
                />
                {errors.ngayBatDau && <div className="error-message">{errors.ngayBatDau}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="ngayKetThuc">Ngày kết thúc <span className="required-star">*</span></label>
                <input
                  type="date"
                  id="ngayKetThuc"
                  name="ngayKetThuc"
                  value={formData.ngayKetThuc}
                  onChange={handleChange}
                  className={errors.ngayKetThuc ? 'error' : ''}
                />
                {errors.ngayKetThuc && <div className="error-message">{errors.ngayKetThuc}</div>}
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
                  placeholder="Nhập đối tượng kiểm tra sức khỏe (vd: Học sinh lớp 1)"
                  className={errors.doiTuong ? 'error' : ''}
                />
                {errors.doiTuong && <div className="error-message">{errors.doiTuong}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="nguoiPhuTrach">Người phụ trách <span className="required-star">*</span></label>
                <input
                  type="text"
                  id="nguoiPhuTrach"
                  name="nguoiPhuTrach"
                  value={formData.nguoiPhuTrach}
                  onChange={handleChange}
                  placeholder="Nhập tên người phụ trách"
                  className={errors.nguoiPhuTrach ? 'error' : ''}
                />
                {errors.nguoiPhuTrach && <div className="error-message">{errors.nguoiPhuTrach}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="trangThai">Trạng thái <span className="required-star">*</span></label>
                <select
                  id="trangThai"
                  name="trangThai"
                  value={formData.trangThai}
                  onChange={handleChange}
                  className={errors.trangThai ? 'error' : ''}
                >
                  <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
                {errors.trangThai && <div className="error-message">{errors.trangThai}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="soLuongHocSinh">Tổng số học sinh <span className="required-star">*</span></label>
                <input
                  type="number"
                  id="soLuongHocSinh"
                  name="soLuongHocSinh"
                  value={formData.soLuongHocSinh}
                  onChange={handleChange}
                  placeholder="Nhập số lượng học sinh"
                  min="1"
                  className={errors.soLuongHocSinh ? 'error' : ''}
                />
                {errors.soLuongHocSinh && <div className="error-message">{errors.soLuongHocSinh}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="daKham">Số học sinh đã khám</label>
                <input
                  type="number"
                  id="daKham"
                  name="daKham"
                  value={formData.daKham}
                  onChange={handleChange}
                  placeholder="Nhập số học sinh đã khám"
                  min="0"
                  className={errors.daKham ? 'error' : ''}
                />
                {errors.daKham && <div className="error-message">{errors.daKham}</div>}
              </div>
              
              <div className="form-group progress-preview">
                <label>Tiến độ hiện tại</label>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${calculateProgress(formData.daKham, formData.soLuongHocSinh)}%`,
                        backgroundColor: formData.trangThai === 'Đã hoàn thành' ? '#38a169' : '#3182ce'
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {formData.daKham || 0}/{formData.soLuongHocSinh || 0} ({calculateProgress(formData.daKham, formData.soLuongHocSinh)}%)
                  </span>
                </div>
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

// Calculate progress percentage
const calculateProgress = (daKham, soLuongHocSinh) => {
  if (!soLuongHocSinh || soLuongHocSinh === 0) return 0;
  return Math.round((daKham / soLuongHocSinh) * 100);
};

export default CheckupModal;
