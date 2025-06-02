import React, { useState, useEffect } from "react";
import RolePermissions from "./RolePermissions";
import "./Permissions.css";

const PermissionsManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching roles data
    setTimeout(() => {
      const mockRoles = [
        { id: "admin", name: "Quản trị viên" },
        { id: "nurse", name: "Y tá" },
        { id: "parent", name: "Phụ huynh" },
        { id: "staff", name: "Nhân viên" },
      ];
      setRoles(mockRoles);
      setSelectedRole(mockRoles[0]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="permissions-management">
      <div className="section-header">
        <h2>Quản lý phân quyền</h2>
      </div>

      {loading ? (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          <div className="role-tabs">
            {roles.map((role) => (
              <button
                key={role.id}
                className={`role-tab ${
                  selectedRole?.id === role.id ? "active" : ""
                }`}
                onClick={() => setSelectedRole(role)}
              >
                {role.name}
              </button>
            ))}
          </div>

          {selectedRole && (
            <RolePermissions
              roleId={selectedRole.id}
              roleName={selectedRole.name}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PermissionsManagement;
