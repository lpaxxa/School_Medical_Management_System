import React, { useState, useEffect } from "react";

// Define permission groups
const permissionGroups = [
  {
    id: "dashboard",
    name: "Dashboard",
    permissions: [
      { id: "view_dashboard", name: "Xem Dashboard" },
      { id: "view_statistics", name: "Xem thống kê" },
    ],
  },
  {
    id: "users",
    name: "Quản lý người dùng",
    permissions: [
      { id: "view_users", name: "Xem danh sách người dùng" },
      { id: "create_users", name: "Thêm người dùng" },
      { id: "edit_users", name: "Sửa thông tin người dùng" },
      { id: "delete_users", name: "Xóa người dùng" },
    ],
  },
  {
    id: "medical_records",
    name: "Hồ sơ y tế",
    permissions: [
      { id: "view_records", name: "Xem hồ sơ" },
      { id: "create_records", name: "Tạo hồ sơ" },
      { id: "edit_records", name: "Cập nhật hồ sơ" },
      { id: "delete_records", name: "Xóa hồ sơ" },
    ],
  },
  {
    id: "reports",
    name: "Báo cáo và thống kê",
    permissions: [
      { id: "view_reports", name: "Xem báo cáo" },
      { id: "generate_reports", name: "Tạo báo cáo" },
      { id: "export_reports", name: "Xuất báo cáo" },
    ],
  },
  {
    id: "system",
    name: "Cài đặt hệ thống",
    permissions: [
      { id: "view_settings", name: "Xem cài đặt" },
      { id: "edit_settings", name: "Thay đổi cài đặt" },
      { id: "manage_roles", name: "Quản lý vai trò" },
    ],
  },
];

const RolePermissions = ({ roleId, roleName }) => {
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Simulate fetching role permissions
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Mock permissions based on role
      let mockPermissions = [];

      switch (roleId) {
        case "admin":
          // Admin has all permissions
          mockPermissions = permissionGroups.flatMap((group) =>
            group.permissions.map((p) => p.id)
          );
          break;
        case "nurse":
          mockPermissions = [
            "view_dashboard",
            "view_statistics",
            "view_records",
            "create_records",
            "edit_records",
            "view_reports",
            "generate_reports",
          ];
          break;
        case "parent":
          mockPermissions = ["view_dashboard", "view_records"];
          break;
        case "staff":
          mockPermissions = [
            "view_dashboard",
            "view_statistics",
            "view_records",
            "view_reports",
            "view_settings",
          ];
          break;
        default:
          break;
      }

      setRolePermissions(mockPermissions);
      setLoading(false);
      setHasChanges(false);
    }, 600);
  }, [roleId]);

  const handlePermissionChange = (permissionId) => {
    setRolePermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
    setHasChanges(true);
  };

  const handleGroupToggle = (groupId) => {
    const groupPermissions = permissionGroups
      .find((g) => g.id === groupId)
      .permissions.map((p) => p.id);

    const allEnabled = groupPermissions.every((p) =>
      rolePermissions.includes(p)
    );

    if (allEnabled) {
      // If all permissions in group are enabled, disable all
      setRolePermissions((prev) =>
        prev.filter((p) => !groupPermissions.includes(p))
      );
    } else {
      // Enable all permissions in group
      const uniquePermissions = new Set([
        ...rolePermissions,
        ...groupPermissions,
      ]);
      setRolePermissions([...uniquePermissions]);
    }

    setHasChanges(true);
  };

  const savePermissions = () => {
    // Show saving indicator
    setLoading(true);

    // Simulate API call to save permissions
    setTimeout(() => {
      setLoading(false);
      setHasChanges(false);
      // Show success message
      alert(`Quyền cho vai trò ${roleName} đã được cập nhật`);
    }, 800);
  };

  return (
    <div className="role-permissions">
      <div className="role-permissions-header">
        <h3>Quyền cho vai trò: {roleName}</h3>
        <button
          className="save-permissions-button"
          onClick={savePermissions}
          disabled={!hasChanges || loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Đang lưu...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> Lưu thay đổi
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : (
        <div className="permissions-groups">
          {permissionGroups.map((group) => (
            <div className="permission-group" key={group.id}>
              <div className="group-header">
                <h4>{group.name}</h4>
                <div className="group-toggle">
                  <label className="toggle-all">
                    <input
                      type="checkbox"
                      checked={group.permissions.every((p) =>
                        rolePermissions.includes(p.id)
                      )}
                      onChange={() => handleGroupToggle(group.id)}
                    />
                    <span>Chọn tất cả</span>
                  </label>
                </div>
              </div>

              <div className="permissions-list">
                {group.permissions.map((permission) => (
                  <div className="permission-item" key={permission.id}>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={rolePermissions.includes(permission.id)}
                        onChange={() => handlePermissionChange(permission.id)}
                      />
                      <span className="checkmark"></span>
                      <span>{permission.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolePermissions;
