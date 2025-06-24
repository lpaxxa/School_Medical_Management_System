import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserMd,
  FaUserTie,
  FaUserCheck,
  FaUserClock,
  FaPlus,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";
import "./UserManagement.css";

const UserManagement = () => {
  // State cho dữ liệu người dùng
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State cho filter và search
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // State cho modals
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // view, add, edit
  const [selectedUser, setSelectedUser] = useState(null);

  // Thống kê
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    nurse: 0,
    parent: 0,
    active: 0,
    inactive: 0,
  });

  // Load dữ liệu mẫu khi component mount
  useEffect(() => {
    setIsLoading(true);
    // Mô phỏng API call
    setTimeout(() => {
      const mockUsers = [
        {
          id: 1,
          name: "Nguyễn Văn Admin",
          email: "admin@school.edu",
          phone: "0901234567",
          role: "admin",
          status: true,
          gender: "Nam",
          createdAt: "15/01/2023",
          lastLogin: "25/06/2023",
          avatar: null,
        },
        {
          id: 2,
          name: "Trần Thị Y Tá",
          email: "nurse@school.edu",
          phone: "0912345678",
          role: "nurse",
          status: true,
          gender: "Nữ",
          createdAt: "10/02/2023",
          lastLogin: "24/06/2023",
          avatar: null,
        },
        {
          id: 3,
          name: "Lê Văn Phụ Huynh",
          email: "parent1@gmail.com",
          phone: "0923456789",
          role: "parent",
          status: true,
          gender: "Nam",
          createdAt: "05/03/2023",
          lastLogin: "20/06/2023",
          avatar: null,
        },
        {
          id: 4,
          name: "Phạm Thị Phụ Huynh",
          email: "parent2@gmail.com",
          phone: "0934567890",
          role: "parent",
          status: false,
          gender: "Nữ",
          createdAt: "20/04/2023",
          lastLogin: "15/06/2023",
          avatar: null,
        },
        {
          id: 5,
          name: "Hoàng Văn Y Tá",
          email: "nurse2@school.edu",
          phone: "0945678901",
          role: "nurse",
          status: true,
          gender: "Nam",
          createdAt: "15/03/2023",
          lastLogin: "23/06/2023",
          avatar: null,
        },
      ];

      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      updateStats(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Cập nhật thống kê
  const updateStats = (usersList) => {
    const stats = {
      total: usersList.length,
      admin: usersList.filter((u) => u.role === "admin").length,
      nurse: usersList.filter((u) => u.role === "nurse").length,
      parent: usersList.filter((u) => u.role === "parent").length,
      active: usersList.filter((u) => u.status).length,
      inactive: usersList.filter((u) => !u.status).length,
    };
    setStats(stats);
  };

  // Xử lý tìm kiếm và lọc
  useEffect(() => {
    let result = [...users];

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      const statusValue = statusFilter === "active";
      result = result.filter((user) => user.status === statusValue);
    }

    // Lọc theo vai trò
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Tìm kiếm theo từ khóa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.phone.toLowerCase().includes(searchLower)
      );
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handlers
  const handleAddUser = () => {
    setModalMode("add");
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleViewUser = (user) => {
    setModalMode("view");
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      // Trong thực tế sẽ gọi API
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
      updateStats(updatedUsers);
    }
  };

  const handleToggleStatus = (userId) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, status: !user.status };
      }
      return user;
    });

    setUsers(updatedUsers);
    updateStats(updatedUsers);
  };

  const handleSaveUser = (userData) => {
    if (modalMode === "add") {
      // Trong thực tế sẽ gọi API để tạo người dùng
      const newUser = {
        ...userData,
        id: users.length + 1,
        createdAt: new Date().toLocaleDateString("vi-VN"),
        lastLogin: "-",
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      updateStats(updatedUsers);
    } else if (modalMode === "edit") {
      // Trong thực tế sẽ gọi API để cập nhật người dùng
      const updatedUsers = users.map((user) => {
        if (user.id === userData.id) {
          return { ...user, ...userData };
        }
        return user;
      });

      setUsers(updatedUsers);
      updateStats(updatedUsers);
    }

    setShowModal(false);
  };

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Quản lý thông tin và phân quyền người dùng trong hệ thống</p>
        </div>
        <button className="btn-add" onClick={handleAddUser}>
          <FaPlus /> Thêm người dùng
        </button>
      </div>

      {/* Thống kê */}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaUsers />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tổng số</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon admin">
            <FaUserTie />
          </div>
          <div className="stat-info">
            <div className="stat-label">Quản trị viên</div>
            <div className="stat-value">{stats.admin}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon nurse">
            <FaUserMd />
          </div>
          <div className="stat-info">
            <div className="stat-label">Y tá trường</div>
            <div className="stat-value">{stats.nurse}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon parent">
            <FaUsers />
          </div>
          <div className="stat-info">
            <div className="stat-label">Phụ huynh</div>
            <div className="stat-value">{stats.parent}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <FaUserCheck />
          </div>
          <div className="stat-info">
            <div className="stat-label">Hoạt động</div>
            <div className="stat-value">{stats.active}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon inactive">
            <FaUserClock />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tạm ngưng</div>
            <div className="stat-value">{stats.inactive}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="user-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter">
            <FaFilter />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="nurse">Y tá trường</option>
              <option value="parent">Phụ huynh</option>
            </select>
          </div>

          <div className="filter">
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
      />

      {/* Modal */}
      {showModal && (
        <UserModal
          mode={modalMode}
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
