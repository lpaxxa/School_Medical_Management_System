import React, { useState } from 'react';
import './UserDetailModal.css';

const UserDetailModal = ({ user, onClose, onEdit, onResetPassword }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  if (!user) return null;

  return (
    <div className="modal-overlay">
      <div className="user-detail-modal">
        <div className="modal-header">
          <h2>Thông tin chi tiết người dùng</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="user-detail-content">
          <div className="user-main-info">
            <div className="user-avatar">
              {user.hoTen ? user.hoTen.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="user-primary-info">
              <h3>{user.hoTen}</h3>
              <span className={`role-badge ${user.vaiTro}`}>
                {user.vaiTro === 'admin' && 'Quản trị viên'}
                {user.vaiTro === 'nurse' && 'Y tá'}
                {user.vaiTro === 'parent' && 'Phụ huynh'}
              </span>
              <span className={`status-badge ${user.trangThai ? 'active' : 'inactive'}`}>
                {user.trangThai ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Thông tin tài khoản</h4>            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Tên đăng nhập</div>
                <div className="detail-value">{user.tenDangNhap}</div>
              </div>              <div className="detail-item">
                <div className="detail-label">Mật khẩu</div>
                <div className="detail-value password-detail">
                  <span className="actual-password">{showPassword ? user.matKhau : '•'.repeat(user.matKhau.length)}</span>
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ display: 'inline-flex' }}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} style={{ fontSize: '16px' }}></i>
                  </button>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value">{user.email}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Số điện thoại</div>
                <div className="detail-value">{user.soDienThoai || '---'}</div>
              </div>
                <div className="detail-item">
                <div className="detail-label">Địa chỉ</div>
                <div className="detail-value">{user.diaChi || '---'}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Giới tính</div>
                <div className="detail-value">
                  {user.gioiTinh === 'nam' && 'Nam'}
                  {user.gioiTinh === 'nu' && 'Nữ'}
                  {user.gioiTinh === 'khac' && 'Khác'}
                  {!user.gioiTinh && '---'}
                </div>
              </div>
              
              {(user.vaiTro === 'parent' || user.vaiTro === 'nurse') && (
                <div className="detail-item">
                  <div className="detail-label">Nghề nghiệp</div>
                  <div className="detail-value">{user.ngheNghiep || '---'}</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Hiển thị thông tin người nhà nếu là y tá */}
          {user.vaiTro === 'nurse' && user.nguoiNha && (
            <div className="detail-section">
              <h4>Thông tin người nhà</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Tên người nhà</div>
                  <div className="detail-value">{user.nguoiNha}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Số điện thoại người nhà</div>
                  <div className="detail-value">{user.sdtNguoiNha || '---'}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Địa chỉ người nhà</div>
                  <div className="detail-value">{user.diaChiNguoiNha || '---'}</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="detail-section">
            <h4>Thông tin hệ thống</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">ID</div>
                <div className="detail-value">{user.id}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Ngày tạo</div>
                <div className="detail-value">{user.ngayTao}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Lần cập nhật cuối</div>
                <div className="detail-value">{user.ngayCapNhat}</div>
              </div>
            </div>
          </div>
            <div className="detail-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
            {user.vaiTro !== 'admin' && (
              <button className="btn btn-warning" onClick={() => onResetPassword(user.id)}>
                <i className="fas fa-key"></i> Đặt lại mật khẩu
              </button>
            )}
            <button className="btn btn-primary" onClick={onEdit}>
              <i className="fas fa-edit"></i> Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
