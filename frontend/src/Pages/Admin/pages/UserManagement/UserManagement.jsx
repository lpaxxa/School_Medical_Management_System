import React, { useState, useEffect } from "react";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const usersPerPage = 8;

  // Mock users data
  const mockUsers = [
    {
      id: 1,
      username: "admin01",
      name: "Nguyễn Quản Trị",
      email: "admin@school.edu.vn",
      role: "admin",
      status: "active",
      lastLogin: "2023-06-05 09:30",
      createdAt: "2023-01-15",
      phone: "0901234567",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      id: 2,
      username: "nurse_hoa",
      name: "Nguyễn Thị Hoa",
      email: "hoa.nurse@school.edu.vn",
      role: "nurse",
      status: "active",
      lastLogin: "2023-06-05 08:15",
      createdAt: "2023-02-01",
      phone: "0912345678",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
      id: 3,
      username: "parent_an",
      name: "Trần Văn An",
      email: "tranvanan@gmail.com",
      role: "parent",
      status: "active",
      lastLogin: "2023-06-04 20:45",
      createdAt: "2023-03-10",
      phone: "0923456789",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg"
    },
    {
      id: 4,
      username: "nurse_binh",
      name: "Lê Thị Bình",
      email: "binh.nurse@school.edu.vn",
      role: "nurse",
      status: "inactive",
      lastLogin: "2023-05-28 16:20",
      createdAt: "2023-02-15",
      phone: "0934567890",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg"
    },
    {
      id: 5,
      username: "parent_cam",
      name: "Nguyễn Thị Cẩm",
      email: "nguyencam@gmail.com",
      role: "parent",
      status: "pending",
      lastLogin: "Chưa đăng nhập",
      createdAt: "2023-06-01",
      phone: "0945678901",
      avatar: "https://randomuser.me/api/portraits/women/5.jpg"
    },
    {
      id: 6,
      username: "parent_duc",
      name: "Phạm Văn Đức",
      email: "ducpv@gmail.com",
      role: "parent",
      status: "active",
      lastLogin: "2023-06-03 14:20",
      createdAt: "2023-03-18",
      phone: "0956789012",
      avatar: "https://randomuser.me/api/portraits/men/6.jpg"
    },
    {
      id: 7,
      username: "nurse_hong",
      name: "Nguyễn Hồng",
      email: "hong.nurse@school.edu.vn",
      role: "nurse",
      status: "active",
      lastLogin: "2023-06-05 07:50",
      createdAt: "2023-02-22",
      phone: "0967890123",
      avatar: "https://randomuser.me/api/portraits/women/7.jpg"
    },
    {
      id: 8,
      username: "parent_giang",
      name: "Lê Thị Giang",
      email: "legiang@gmail.com",
      role: "parent",
      status: "inactive",
      lastLogin: "2023-05-15 09:35",
      createdAt: "2023-04-05",
      phone: "0978901234",
      avatar: "https://randomuser.me/api/portraits/women/8.jpg"
    },
    {
      id: 9,
      username: "admin02",
      name: "Trần Khải Hoàn",
      email: "hoan.admin@school.edu.vn",
      role: "admin",
      status: "active",
      lastLogin: "2023-06-04 17:30",
      createdAt: "2023-01-20",
      phone: "0989012345",
      avatar: "https://randomuser.me/api/portraits/men/9.jpg"
    },
    {
      id: 10,
      username: "parent_khang",
      name: "Vũ Đức Khang",
      email: "vukhang@gmail.com",
      role: "parent",
      status: "pending",
      lastLogin: "Chưa đăng nhập",
      createdAt: "2023-05-28",
      phone: "0990123456",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedRole, users, sortConfig]);

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: "Quản trị viên",
      nurse: "Y tá",
      parent: "Phụ huynh"
    };
    return roles[role] || role;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      active: { label: "Hoạt động", class: "active" },
      inactive: { label: "Không hoạt động", class: "inactive" },
      pending: { label: "Chờ duyệt", class: "pending" }
    };
    return statuses[status] || { label: status, class: "unknown" };
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div className="header-title">
          <h1>
            <i className="fas fa-users"></i>
            Quản lý người dùng
          </h1>
          <p>Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddUser}>
          <i className="fas fa-plus"></i>
          Thêm người dùng
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon admin">
            <i className="fas fa-user-shield"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter(u => u.role === 'admin').length}</h3>
            <p>Quản trị viên</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon nurse">
            <i className="fas fa-user-nurse"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter(u => u.role === 'nurse').length}</h3>
            <p>Y tá</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon parent">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter(u => u.role === 'parent').length}</h3>
            <p>Phụ huynh</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter(u => u.status === 'active').length}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="user-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Vai trò:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">Tất cả</option>
            <option value="admin">Quản trị viên</option>
            <option value="nurse">Y tá</option>
            <option value="parent">Phụ huynh</option>
          </select>
        </div>
        <div className="results-count">
          Hiển thị <span>{currentUsers.length}</span> / <span>{filteredUsers.length}</span> người dùng
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('name')}>
                <div className="th-content">
                  Người dùng
                  {sortConfig.key === 'name' && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
              <th className="sortable" onClick={() => requestSort('role')}>
                <div className="th-content">
                  Vai trò
                  {sortConfig.key === 'role' && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
              <th className="sortable" onClick={() => requestSort('status')}>
                <div className="th-content">
                  Trạng thái
                  {sortConfig.key === 'status' && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
              <th className="sortable" onClick={() => requestSort('lastLogin')}>
                <div className="th-content">
                  Đăng nhập cuối
                  {sortConfig.key === 'lastLogin' && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
              <th className="sortable" onClick={() => requestSort('createdAt')}>
                <div className="th-content">
                  Ngày tạo
                  {sortConfig.key === 'createdAt' && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        <img src={user.avatar} alt={user.name} />
                      </div>
                      <div className="user-details">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                        <div className="user-meta">
                          <span className="username">@{user.username}</span>
                          <span className="phone">{user.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(user.status).class}`}>
                      {getStatusBadge(user.status).label}
                    </span>
                  </td>
                  <td className="last-login">{user.lastLogin}</td>
                  <td className="created-date">{user.createdAt}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEditUser(user)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                      <div className="status-dropdown">
                        <button className="btn-icon status" title="Thay đổi trạng thái">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <div className="dropdown-content">
                          <button onClick={() => handleStatusChange(user.id, 'active')}>
                            <i className="fas fa-check-circle"></i> Kích hoạt
                          </button>
                          <button onClick={() => handleStatusChange(user.id, 'inactive')}>
                            <i className="fas fa-pause-circle"></i> Tạm dừng
                          </button>
                          <button onClick={() => handleStatusChange(user.id, 'pending')}>
                            <i className="fas fa-clock"></i> Chờ duyệt
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-row">
                <td colSpan="6">
                  <div className="empty-state">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy người dùng nào phù hợp với tìm kiếm</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-pagination prev"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="pagination-pages">
            {[...Array(totalPages)].map((_, index) => {
              // Always show first, last, current and one before/after current
              const pageNum = index + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`btn-pagination ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === currentPage - 2 && currentPage > 3) || 
                (pageNum === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return <span key={pageNum} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-pagination next"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={(userData) => {
            if (editingUser) {
              setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
            } else {
              const newUser = {
                id: Date.now(),
                ...userData,
                status: 'pending',
                lastLogin: 'Chưa đăng nhập',
                createdAt: new Date().toLocaleDateString('vi-VN'),
                avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 10 + 1)}.jpg`
              };
              setUsers([...users, newUser]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "parent",
    phone: user?.phone || "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({...errors, [name]: null});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username là bắt buộc";
    } else if (formData.username.length < 4) {
      newErrors.username = "Username phải có ít nhất 4 ký tự";
    }
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Họ tên là bắt buộc";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }
    
    // Phone validation
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
    }
    
    // Password validation for new users
    if (!user) {
      if (!formData.password) {
        newErrors.password = "Mật khẩu là bắt buộc";
      } else if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Remove password fields if we're editing and no new password
    const userData = {...formData};
    if (user && !userData.password) {
      delete userData.password;
      delete userData.confirmPassword;
    }
    
    onSave(userData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            {user ? `Chỉnh sửa: ${user.name}` : "Thêm người dùng mới"}
          </h3>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username <span className="required">*</span></label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder="Nhập username..."
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Vai trò <span className="required">*</span></label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="parent">Phụ huynh</option>
                <option value="nurse">Y tá</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Họ và tên <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Nhập họ và tên..."
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="example@email.com"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="0xxxxxxxxx"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
          </div>

          {(!user || (user && formData.password)) && (
            <>
              <div className="form-divider">
                <span>Thông tin đăng nhập</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">{user ? "Mật khẩu mới" : "Mật khẩu"} {!user && <span className="required">*</span>}</label>
                  <div className="password-field">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'error' : ''}
                      placeholder={user ? "Để trống nếu không đổi" : "Nhập mật khẩu..."}
                    />
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu {!user && <span className="required">*</span>}</label>
                  <div className="password-field">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? 'error' : ''}
                      placeholder="Nhập lại mật khẩu..."
                    />
                  </div>
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {user ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;