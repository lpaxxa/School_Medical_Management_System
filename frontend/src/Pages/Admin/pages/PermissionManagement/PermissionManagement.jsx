import React, { useState, useEffect } from "react";
import "./PermissionManagement.css";

const PermissionManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock data for roles
  const mockRoles = [
    {
      id: 1,
      name: "admin",
      label: "Quản trị viên",
      description: "Quyền truy cập đầy đủ vào hệ thống",
    },
    {
      id: 2,
      name: "nurse",
      label: "Y tá",
      description: "Quản lý sức khỏe học sinh và báo cáo y tế",
    },
    {
      id: 3,
      name: "manager",
      label: "Ban giám hiệu",
      description: "Xem báo cáo và thống kê",
    },
    {
      id: 4,
      name: "parent",
      label: "Phụ huynh",
      description: "Xem thông tin sức khỏe của con em",
    },
  ];

  // Mock data for permissions
  const mockPermissions = [
    {
      id: 1,
      name: "user_management",
      label: "Quản lý người dùng",
      description: "Thêm, sửa, xóa người dùng trong hệ thống",
      modules: [
        { id: 1, name: "user_view", label: "Xem người dùng" },
        { id: 2, name: "user_create", label: "Thêm người dùng" },
        { id: 3, name: "user_edit", label: "Sửa người dùng" },
        { id: 4, name: "user_delete", label: "Xóa người dùng" },
      ],
    },
    {
      id: 2,
      name: "role_management",
      label: "Quản lý vai trò",
      description: "Quản lý vai trò và phân quyền",
      modules: [
        { id: 5, name: "role_view", label: "Xem vai trò" },
        { id: 6, name: "role_assign", label: "Gán vai trò" },
        { id: 7, name: "permission_edit", label: "Sửa quyền" },
      ],
    },
    {
      id: 3,
      name: "health_records",
      label: "Hồ sơ sức khỏe",
      description: "Quản lý thông tin sức khỏe học sinh",
      modules: [
        { id: 8, name: "health_view", label: "Xem hồ sơ" },
        { id: 9, name: "health_create", label: "Tạo hồ sơ" },
        { id: 10, name: "health_edit", label: "Cập nhật hồ sơ" },
        { id: 11, name: "health_delete", label: "Xóa hồ sơ" },
      ],
    },
    {
      id: 4,
      name: "medication",
      label: "Quản lý thuốc",
      description: "Quản lý đăng ký và cung cấp thuốc",
      modules: [
        { id: 12, name: "medication_view", label: "Xem thuốc" },
        { id: 13, name: "medication_approve", label: "Phê duyệt" },
        { id: 14, name: "medication_administer", label: "Cho dùng thuốc" },
      ],
    },
    {
      id: 5,
      name: "reports",
      label: "Báo cáo",
      description: "Xem và xuất báo cáo",
      modules: [
        { id: 15, name: "report_view", label: "Xem báo cáo" },
        { id: 16, name: "report_export", label: "Xuất báo cáo" },
        { id: 17, name: "report_create", label: "Tạo báo cáo" },
      ],
    },
    {
      id: 6,
      name: "settings",
      label: "Cài đặt hệ thống",
      description: "Quản lý cài đặt hệ thống",
      modules: [
        { id: 18, name: "settings_view", label: "Xem cài đặt" },
        { id: 19, name: "settings_edit", label: "Sửa cài đặt" },
      ],
    },
  ];

  // Role permission mappings
  const mockRolePermissions = {
    admin: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    nurse: [8, 9, 10, 11, 12, 13, 14, 15, 17],
    manager: [8, 15, 16],
    parent: [8, 12],
  };

  useEffect(() => {
    // Simulate API call to get roles
    setRoles(mockRoles);
    setPermissions(mockPermissions);

    // Set admin as default selected role
    setSelectedRole(mockRoles[0]);
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSaveSuccess(false);
  };

  const isPermissionSelected = (permissionId) => {
    if (!selectedRole) return false;
    return (
      mockRolePermissions[selectedRole.name]?.includes(permissionId) || false
    );
  };

  const togglePermission = (permissionId) => {
    setSaveSuccess(false);

    // In a real app, this would update the state
    // For this demo, we're just showing the UI interaction
    console.log(
      `Toggled permission ${permissionId} for role ${selectedRole.name}`
    );
  };

  const handleSavePermissions = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
    }, 1000);
  };

  const handleAddRole = () => {
    // In a real app, this would open a modal to add a new role
    console.log("Open add role modal");
  };

  return (
    <div className="permission-management">
      <div className="permission-header">
        <div className="header-title">
          <h1>
            <i className="fas fa-shield-alt"></i>
            Phân quyền hệ thống
          </h1>
          <p>Quản lý quyền truy cập cho từng vai trò trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddRole}>
          <i className="fas fa-plus"></i>
          Thêm vai trò
        </button>
      </div>

      <div className="permission-content">
        <div className="roles-sidebar">
          <h3 className="sidebar-title">Vai trò</h3>
          <ul className="roles-list">
            {roles.map((role) => (
              <li
                key={role.id}
                className={selectedRole?.id === role.id ? "active" : ""}
                onClick={() => handleRoleSelect(role)}
              >
                <div className="role-icon">
                  {role.name === "admin" && (
                    <i className="fas fa-user-shield"></i>
                  )}
                  {role.name === "nurse" && (
                    <i className="fas fa-user-nurse"></i>
                  )}
                  {role.name === "manager" && (
                    <i className="fas fa-user-tie"></i>
                  )}
                  {role.name === "parent" && (
                    <i className="fas fa-user-friends"></i>
                  )}
                </div>
                <div className="role-info">
                  <h4>{role.label}</h4>
                  <p>{role.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedRole && (
          <div className="permissions-container">
            <div className="selected-role">
              <h2>Quyền cho vai trò: {selectedRole.label}</h2>
              <p>{selectedRole.description}</p>
            </div>

            {saveSuccess && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                Đã lưu cập nhật quyền thành công!
              </div>
            )}

            <div className="permissions-grid">
              {permissions.map((permission) => (
                <div key={permission.id} className="permission-card">
                  <div className="permission-header">
                    <h3>{permission.label}</h3>
                    <p>{permission.description}</p>
                  </div>
                  <div className="modules-list">
                    {permission.modules.map((module) => (
                      <div key={module.id} className="module-item">
                        <label className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={isPermissionSelected(module.id)}
                            onChange={() => togglePermission(module.id)}
                          />
                          <span className="checkmark"></span>
                          <span className="module-label">{module.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="save-permissions">
              <button
                className="btn btn-primary"
                onClick={handleSavePermissions}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionManagement;
