import React, { useState, useEffect } from 'react';
import './UserModal.css';

const UserModal = ({ onClose, onSave, initialData = null, modalType = 'add' }) => {
  const isEditMode = modalType === 'edit';  const [formData, setFormData] = useState({
    hoTen: '',
    tenDangNhap: '',
    matKhau: '',
    email: '',
    soDienThoai: '',
    diaChi: '',
    vaiTro: 'parent',
    gioiTinh: '',
    ngheNghiep: '',
    nguoiNha: '',
    sdtNguoiNha: '',
    diaChiNguoiNha: '',
    trangThai: true,
    showPassword: false
  });
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        ...initialData,
        showPassword: false // Initialize with password hidden
      });
    }
  }, [isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    
    // Reset nghề nghiệp nếu đổi từ phụ huynh sang role khác
    if (formData.vaiTro === 'parent' && newRole !== 'parent') {
      setFormData({
        ...formData,
        vaiTro: newRole,
        ngheNghiep: newRole === 'nurse' ? 'Y tá' : '',
        nguoiNha: '',
        sdtNguoiNha: '',
        diaChiNguoiNha: ''
      });
    } 
    // Set nghề nghiệp mặc định nếu chọn y tá
    else if (newRole === 'nurse') {
      setFormData({
        ...formData,
        vaiTro: newRole,
        ngheNghiep: 'Y tá'
      });
    } 
    else {
      setFormData({
        ...formData,
        vaiTro: newRole
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="user-modal">
        <div className="modal-header">
          <h2>{isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hoTen">Họ tên <span className="required">*</span></label>
                <input
                  type="text"
                  id="hoTen"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-row">
              {!isEditMode && (
                <div className="form-group">
                  <label htmlFor="tenDangNhap">Tên đăng nhập <span className="required">*</span></label>
                  <input
                    type="text"
                    id="tenDangNhap"
                    name="tenDangNhap"
                    value={formData.tenDangNhap}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              )}              <div className="form-group">
                <label htmlFor="matKhau">Mật khẩu <span className="required">*</span></label>
                <div className="password-input-container">
                  <input
                    type={formData.showPassword ? "text" : "password"}
                    id="matKhau"
                    name="matKhau"
                    value={formData.matKhau}
                    onChange={handleChange}
                    required={!isEditMode}
                    className="form-control"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setFormData(prev => ({...prev, showPassword: !prev.showPassword}))}
                  >
                    <i className={`fas ${formData.showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
              
              {isEditMode && (
                <div className="form-group">
                  <label htmlFor="soDienThoai">Số điện thoại</label>
                  <input
                    type="tel"
                    id="soDienThoai"
                    name="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              )}
            </div>
            
            {!isEditMode && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="soDienThoai">Số điện thoại</label>
                  <input
                    type="tel"
                    id="soDienThoai"
                    name="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="diaChi">Địa chỉ</label>
              <textarea
                id="diaChi"
                name="diaChi"
                value={formData.diaChi}
                onChange={handleChange}
                className="form-control"
                rows="2"
              ></textarea>
            </div>
              <div className="form-row">
              <div className="form-group">
                <label htmlFor="vaiTro">Vai trò <span className="required">*</span></label>
                <select
                  id="vaiTro"
                  name="vaiTro"
                  value={formData.vaiTro}
                  onChange={handleRoleChange}
                  required
                  className="form-control"
                  // Đã bỏ disabled để cho phép đổi vai trò khi chỉnh sửa
                >
                  <option value="admin">Quản trị viên</option>
                  <option value="nurse">Y tá</option>
                  <option value="parent">Phụ huynh</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="gioiTinh">Giới tính <span className="required">*</span></label>
                <select
                  id="gioiTinh"
                  name="gioiTinh"
                  value={formData.gioiTinh || ''}
                  onChange={handleChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="nam">Nam</option>
                  <option value="nu">Nữ</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
            </div>
              
            <div className="form-row">
              {(formData.vaiTro === 'parent' || formData.vaiTro === 'nurse') && (
                <div className="form-group">
                  <label htmlFor="ngheNghiep">Nghề nghiệp</label>
                  <input
                    type="text"
                    id="ngheNghiep"
                    name="ngheNghiep"
                    value={formData.ngheNghiep}
                    onChange={handleChange}
                    className="form-control"
                    disabled={formData.vaiTro === 'nurse'} // Y tá mặc định nghề nghiệp là "Y tá"
                  />
                </div>
              )}
            </div>
            
            {!isEditMode && (
              <div className="form-group">
                <label htmlFor="trangThai" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="trangThai"
                    name="trangThai"
                    checked={formData.trangThai}
                    onChange={handleChange}
                  />
                  <span>Hoạt động</span>
                </label>
              </div>
            )}
          </div>
          
          {/* Thông tin bổ sung cho Y tá */}
          {formData.vaiTro === 'nurse' && (
            <div className="form-section">
              <h3>Thông tin người liên hệ</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nguoiNha">Tên người nhà</label>
                  <input
                    type="text"
                    id="nguoiNha"
                    name="nguoiNha"
                    value={formData.nguoiNha}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="sdtNguoiNha">Số điện thoại người nhà</label>
                  <input
                    type="tel"
                    id="sdtNguoiNha"
                    name="sdtNguoiNha"
                    value={formData.sdtNguoiNha}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="diaChiNguoiNha">Địa chỉ người nhà</label>
                <textarea
                  id="diaChiNguoiNha"
                  name="diaChiNguoiNha"
                  value={formData.diaChiNguoiNha}
                  onChange={handleChange}
                  className="form-control"
                  rows="2"
                ></textarea>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
