import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./UserManagement.css";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";
import UserDetailModal from "./components/UserDetailModal";
import axios from "axios";

// Mock data for users with gender field
const mockUsers = [
  {
    id: 1,
    hoTen: "Nguyễn Văn Admin",
    tenDangNhap: "admin",
    matKhau: "admin123",
    email: "admin@school.edu.vn",
    soDienThoai: "0901234567",
    diaChi: "123 Đường Giáo Dục, TP HCM",
    vaiTro: "admin",
    gioiTinh: "nam",
    trangThai: true,
    ngayTao: "2023-01-15",
    ngayCapNhat: "2023-06-01",
  },
  {
    id: 2,
    hoTen: "Trần Thị Y Tá",
    tenDangNhap: "nurse1",
    matKhau: "nurse123",
    email: "nurse@school.edu.vn",
    soDienThoai: "0912345678",
    diaChi: "456 Đường Y Tế, TP HCM",
    vaiTro: "nurse",
    gioiTinh: "nu",
    ngheNghiep: "Y tá",
    nguoiNha: "Trần Văn A",
    sdtNguoiNha: "0987654321",
    diaChiNguoiNha: "456 Đường Lâm Sàng, TP HCM",
    trangThai: true,
    ngayTao: "2023-03-20",
    ngayCapNhat: "2023-05-15",
  },
  {
    id: 3,
    hoTen: "Lê Văn Phụ Huynh",
    tenDangNhap: "parent1",
    matKhau: "parent123",
    email: "parent@gmail.com",
    soDienThoai: "0923456789",
    diaChi: "789 Đường Gia Đình, TP HCM",
    vaiTro: "parent",
    gioiTinh: "nam",
    ngheNghiep: "Kỹ sư",
    trangThai: true,
    ngayTao: "2023-05-10",
    ngayCapNhat: "2023-06-10",
  },
  {
    id: 4,
    hoTen: "Phạm Thị Phụ Huynh",
    tenDangNhap: "parent2",
    matKhau: "parent456",
    email: "parent2@gmail.com",
    soDienThoai: "0934567890",
    diaChi: "101 Đường Học Vấn, TP HCM",
    vaiTro: "parent",
    gioiTinh: "nu",
    ngheNghiep: "Giáo viên",
    trangThai: false,
    ngayTao: "2023-06-05", 
    ngayCapNhat: "2023-04-20",
  },
];

// API service functions integrated directly
const USE_MOCK_API = true; // Luôn sử dụng mock API không phụ thuộc vào biến môi trường

// API URL cố định để sử dụng trong trường hợp không dùng mock data
const API_URL = 'http://localhost:5000/api';

// Axios instance with auth header
const authAxios = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// API service functions
const userApiService = {
  // Get all users (with optional filters)
  getAllUsers: async (filters = {}) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for getAllUsers");
      
      // Simulate delay for network request
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use the mockUsers from component scope
      let filteredUsers = [...mockUsers];
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.vaiTro === filters.role);
      }
      
      if (filters.status) {
        if (filters.status === 'active') {
          filteredUsers = filteredUsers.filter(user => user.trangThai === true);
        } else if (filters.status === 'inactive') {
          filteredUsers = filteredUsers.filter(user => user.trangThai === false);
        }
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.hoTen.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.soDienThoai.includes(searchLower)
        );
      }
      
      return filteredUsers;
    }
    
    // Real API call
    try {
      const params = new URLSearchParams();
      
      // Apply filters to query params
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const response = await authAxios().get(`/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  // Get a single user by ID
  getUserById: async (userId) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for getUserById", userId);
      // Simulate delay for network request
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const user = mockUsers.find(u => u.id === userId);
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      return user;
    }
    
    try {
      const response = await authAxios().get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for createUser");
      
      // Simulate delay for network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a new mock user with auto-incrementing ID
      const newUserId = Math.max(...mockUsers.map(u => u.id)) + 1;
      const currentDate = new Date().toISOString().split('T')[0];
      
      const newUser = {
        ...userData,
        id: newUserId,
        ngayTao: currentDate,
        ngayCapNhat: currentDate,
        matKhau: "******" // Hide password in response
      };
      
      // Add to mock data (for session persistence)
      mockUsers.push(newUser);
      
      return newUser;
    }
    
    try {
      const response = await authAxios().post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update an existing user
  updateUser: async (userId, userData) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for updateUser", userId);
      
      // Simulate delay for network request
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Find user index in the array
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Update user data and current date
      const currentDate = new Date().toISOString().split('T')[0];      const updatedUser = {
        ...mockUsers[userIndex],
        ...userData,
        id: userId, // Make sure ID stays the same
        ngayCapNhat: currentDate,
        matKhau: userData.matKhau || mockUsers[userIndex].matKhau // Keep the actual password
      };
      
      // Update in mock data
      mockUsers[userIndex] = updatedUser;
      
      return updatedUser;
    }
    
    try {
      const response = await authAxios().put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (userId) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for deleteUser", userId);
      
      // Simulate delay for network request
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Remove from mock data
      mockUsers.splice(userIndex, 1);
      
      return { success: true, message: 'User deleted successfully' };
    }
    
    try {
      const response = await authAxios().delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  // Change user status (active/inactive)
  changeUserStatus: async (userId, status) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for changeUserStatus", userId, status);
      
      // Simulate delay for network request
      await new Promise(resolve => setTimeout(resolve, 250));
      
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Update user status
      mockUsers[userIndex].trangThai = status;
      mockUsers[userIndex].ngayCapNhat = new Date().toISOString().split('T')[0];
      
      return { 
        ...mockUsers[userIndex],
        success: true 
      };
    }
    
    try {
      const response = await authAxios().patch(`/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error changing status for user ${userId}:`, error);
      throw error;
    }
  },

  // Change user password (admin operation)
  resetUserPassword: async (userId, newPassword) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for resetUserPassword", userId);
      
      // Simulate delay for network request
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error(`User with ID ${userId} not found`);
      }
        // Update user password with actual visible password
      mockUsers[userIndex].matKhau = newPassword; 
      mockUsers[userIndex].ngayCapNhat = new Date().toISOString().split('T')[0];
      
      return { 
        success: true, 
        message: 'Password reset successfully'
      };
    }
    
    try {
      const response = await authAxios().post(`/users/${userId}/reset-password`, { password: newPassword });
      return response.data;
    } catch (error) {
      console.error(`Error resetting password for user ${userId}:`, error);
      throw error;
    }
  }
};

const UserManagement = () => {
  // Get saved filter preferences from localStorage, if any
  const getSavedPreference = (key, defaultValue) => {
    const saved = localStorage.getItem(`userManagement_${key}`);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  };

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(
    getSavedPreference("searchTerm", "")
  );
  const [roleFilter, setRoleFilter] = useState(
    getSavedPreference("roleFilter", "all")
  );
  const [statusFilter, setStatusFilter] = useState(
    getSavedPreference("statusFilter", "all")
  );

  // Function to fetch users with current filters
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {
        role: roleFilter !== "all" ? roleFilter : null,
        status: statusFilter !== "all" ? statusFilter : null,
        search: searchTerm || null,
      };

      // Try to get users from API
      const fetchedUsers = await userApiService.getAllUsers(filters);
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Không thể tải dữ liệu người dùng. Đang sử dụng dữ liệu mẫu.");

      // Fallback to mock data if API fails
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    // Filter users locally
    if (searchTerm || roleFilter !== "all" || statusFilter !== "all") {
      const filtered = users.filter((user) => {
        // Search
        const searchMatch =
          user.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.soDienThoai?.includes(searchTerm);

        // Role filter
        const roleMatch = roleFilter === "all" || user.vaiTro === roleFilter;

        // Status filter
        const statusMatch =
          statusFilter === "all" ||
          (statusFilter === "active" && user.trangThai) ||
          (statusFilter === "inactive" && !user.trangThai);

        return searchMatch && roleMatch && statusMatch;
      });

      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleAddUser = async (userData) => {
    setIsLoading(true);
    try {
      // Try to create user via API
      const newUser = await userApiService.createUser(userData);
      setUsers((prevUsers) => [...prevUsers, newUser]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Không thể thêm người dùng. Vui lòng thử lại.");

      // Fallback to mock data behavior
      const mockNewUser = {
        ...userData,
        id: Math.max(...users.map((u) => u.id)) + 1,
        ngayTao: new Date().toISOString().split("T")[0],
        ngayCapNhat: new Date().toISOString().split("T")[0],
      };

      setUsers([...users, mockNewUser]);
      setShowAddModal(false);
    } finally {
      setIsLoading(false);
    }
  };
  const handleViewUser = async (user) => {
    setIsLoading(true);
    try {
      // Try to get detailed user info from API
      // Make sure we're getting the user with their actual password
      const detailedUser = await userApiService.getUserById(user.id);
      // Ensure password is visible
      setCurrentUser({...detailedUser, matKhau: user.matKhau});
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Use the existing user data if API fails
      setCurrentUser(user);
    } finally {
      setIsLoading(false);
      setShowDetailModal(true);
    }
  };
  const handleEditUser = (user) => {
    // Make sure we have the user with the actual password
    const userWithRealPassword = {...user};
    setCurrentUser(userWithRealPassword);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedUserData) => {
    setIsLoading(true);
    try {
      // Try to update user via API
      const updatedUser = await userApiService.updateUser(
        updatedUserData.id,
        updatedUserData
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Không thể cập nhật người dùng. Vui lòng thử lại.");

      // Fallback to mock data behavior
      const mockUpdatedUser = {
        ...updatedUserData,
        ngayCapNhat: new Date().toISOString().split("T")[0],
      };

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === mockUpdatedUser.id ? mockUpdatedUser : user
        )
      );
      setShowEditModal(false);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      setIsLoading(true);
      try {
        // Try to delete user via API
        await userApiService.deleteUser(userId);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Không thể xóa người dùng. Vui lòng thử lại.");

        // Fallback to mock data behavior
        setUsers(users.filter((user) => user.id !== userId));
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleToggleStatus = async (userId, newStatus) => {
    setIsLoading(true);
    try {
      // Try to update user status via API
      await userApiService.changeUserStatus(userId, newStatus);

      // Update the users list with new status
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                trangThai: newStatus,
                ngayCapNhat: new Date().toISOString().split("T")[0],
              }
            : user
        )
      );
    } catch (error) {
      console.error("Error changing user status:", error);
      alert(
        `Không thể ${
          newStatus ? "kích hoạt" : "tạm ngưng"
        } người dùng. Vui lòng thử lại.`
      );

      // Fallback to mock data behavior
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                trangThai: newStatus,
                ngayCapNhat: new Date().toISOString().split("T")[0],
              }
            : user
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleResetPassword = async (userId) => {
    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    if (
      window.confirm(
        "Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này không?"
      )
    ) {
      setIsLoading(true);
      try {
        // Try to reset password via API
        await userApiService.resetUserPassword(userId, tempPassword);

        // Show the temporary password
        alert(
          `Mật khẩu tạm thời: ${tempPassword}\n\nVui lòng cung cấp mật khẩu này cho người dùng và yêu cầu họ đổi mật khẩu ngay khi đăng nhập.`
        );

        // Update the user with the visible password in our list
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { 
                  ...user, 
                  matKhau: tempPassword, // Update with the new visible password
                  ngayCapNhat: new Date().toISOString().split("T")[0] 
                }
              : user
          )
        );} catch (error) {
        console.error("Error resetting password:", error);
        alert(`Không thể đặt lại mật khẩu. Vui lòng thử lại.`);
        // Luôn hiển thị mật khẩu tạm thời trong chế độ demo
        alert(`Mật khẩu tạm thời (DEMO MODE): ${tempPassword}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to reset all filters
  const resetAllFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    localStorage.removeItem("userManagement_searchTerm");
    localStorage.removeItem("userManagement_roleFilter");
    localStorage.removeItem("userManagement_statusFilter");
  };

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div className="header-title">
          <h1>
            <i className="fas fa-users-cog"></i> Quản lý người dùng
          </h1>
          <p>Quản lý và phân quyền người dùng trong hệ thống y tế học đường</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus"></i> Thêm người dùng
        </button>
      </div>

      {/* Error message display */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon admin">
            <i className="fas fa-user-shield"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter((user) => user.vaiTro === "admin").length}</h3>
            <p>Quản trị viên</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon nurse">
            <i className="fas fa-user-nurse"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter((user) => user.vaiTro === "nurse").length}</h3>
            <p>Y tá</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon parent">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter((user) => user.vaiTro === "parent").length}</h3>
            <p>Phụ huynh</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter((user) => user.trangThai).length}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="user-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>{" "}
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              localStorage.setItem(
                "userManagement_searchTerm",
                JSON.stringify(value)
              );
            }}
          />
        </div>
        <div className="filter-controls">
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => {
              const value = e.target.value;
              setRoleFilter(value);
              localStorage.setItem(
                "userManagement_roleFilter",
                JSON.stringify(value)
              );
            }}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="nurse">Y tá</option>
            <option value="parent">Phụ huynh</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value);
              localStorage.setItem(
                "userManagement_statusFilter",
                JSON.stringify(value)
              );
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm ngưng</option>
          </select>

          {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
            <button
              className="btn-reset-filter"
              onClick={resetAllFilters}
              title="Xóa bộ lọc"
            >
              <i className="fas fa-times-circle"></i> Xóa
            </button>
          )}          {/* Đã xóa select trùng lặp không cần thiết */}
        </div>

        {/* Nút reset bộ lọc */}
        <button className="btn btn-secondary" onClick={resetAllFilters}>
          <i className="fas fa-undo"></i> Đặt lại bộ lọc
        </button>
      </div>

      {/* Bảng người dùng */}
      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
      />

      {/* Các modal */}
      {showAddModal && (
        <UserModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddUser}
          modalType="add"
        />
      )}

      {showEditModal && currentUser && (
        <UserModal
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateUser}
          initialData={currentUser}
          modalType="edit"
        />
      )}      {showDetailModal && currentUser && (
        <UserDetailModal
          user={currentUser}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
          onResetPassword={handleResetPassword}
        />      )}
    </div>
  );
};

// UserManagementPage Component (gộp từ index.jsx)
const UserManagementPage = () => {
  return (
    <div className="user-management-page">
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;
