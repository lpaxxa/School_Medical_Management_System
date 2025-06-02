import React, { useState, useEffect } from "react";
import UserList from "./UserList";
import UserForm from "./UserForm";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch users
    const fetchUsers = async () => {
      try {
        // Replace with actual API call
        setTimeout(() => {
          const mockUsers = [
            {
              id: 1,
              name: "Nguyễn Văn A",
              email: "nguyenvana@example.com",
              role: "admin",
              status: "active",
            },
            {
              id: 2,
              name: "Trần Thị B",
              email: "tranthib@example.com",
              role: "nurse",
              status: "active",
            },
            {
              id: 3,
              name: "Lê Văn C",
              email: "levanc@example.com",
              role: "parent",
              status: "inactive",
            },
          ];
          setUsers(mockUsers);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddingUser(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsAddingUser(false);
  };

  const handleSaveUser = (userData) => {
    // Handle save/update user logic
    if (isAddingUser) {
      // Add new user
      const newUser = { ...userData, id: Date.now() };
      setUsers([...users, newUser]);
    } else {
      // Update existing user
      setUsers(
        users.map((user) =>
          user.id === userData.id ? { ...user, ...userData } : user
        )
      );
    }

    setSelectedUser(null);
    setIsAddingUser(false);
  };

  const handleDeleteUser = (userId) => {
    // Add confirmation dialog in a real application
    setUsers(users.filter((user) => user.id !== userId));
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>Quản lý người dùng</h2>
        <button className="add-button" onClick={handleAddUser}>
          <i className="fas fa-plus"></i> Thêm người dùng
        </button>
      </div>

      {selectedUser || isAddingUser ? (
        <UserForm
          user={selectedUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setSelectedUser(null);
            setIsAddingUser(false);
          }}
          isAdding={isAddingUser}
        />
      ) : (
        <UserList
          users={users}
          loading={loading}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
