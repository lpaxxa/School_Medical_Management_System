import React, { useState, useEffect } from "react";
import "./PermissionsManagement.css";

const PermissionsManagement = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock data for roles
  const mockRoles = [
    {
      id: 1,
      name: "admin",
      label: "Quản trị viên",
      description: "Quyền truy cập đầy đủ hệ thống",
    },
    {
      id: 2,
      name: "nurse",
      label: "Y tá",
      description: "Quản lý sức khỏe học sinh",
    },
    {
      id: 3,
      name: "manager",
      label: "Quản lý",
      description: "Xem báo cáo và thống kê",
    },
    {
      id: 4,
      name: "parent",
      label: "Phụ huynh",
      description: "Xem thông tin sức khỏe của con em",
    },
  ];

  // Basic permissions list
  const mockPermissions = [
    {
      id: 1,
      name: "user_management",
      label: "Quản lý người dùng",
      description: "Thêm, sửa, xóa người dùng trong hệ thống",
      modules: [
        { id: 1, name: "user_view", label: "Xem người dùng" },
        { id: 2, name: "user_create", label: "Thêm người dùng" }
      ]
    },
    {
      id: 2,
      name: "health_records",
      label: "Hồ sơ sức khỏe",
      description: "Quản lý thông tin sức khỏe học sinh",
      modules: [
        { id: 3, name: "health_view", label: "Xem hồ sơ" },
        { id: 4, name: "health_edit", label: "Cập nhật hồ sơ" }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call to get roles
    setRoles(mockRoles);
    setPermissions(mockPermissions);

    // Set admin as default selected role
    setSelectedRole(mockRoles[0]);
  }, []);

  const handleSavePermissions = () => {
    // Simulate saving permissions
    setSaveSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };  return (
    <div className="permissions-page">
      <div className="permissions-content">
        <div className="permissions-header">
          <h2>Quản lý phân quyền</h2>
        </div>
        
        <div className="roles-container">
          <div className="role-sidebar">
            <ul className="role-list">
              {roles.map(role => (
                <li 
                  key={role.id}
                  className={`role-item ${selectedRole && selectedRole.id === role.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedRole(role);
                    setSaveSuccess(false);
                  }}
                >
                  <i className="fas fa-user-tag"></i>
                  {role.label}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="permission-content">
            {selectedRole && (
              <>
                <h3>{selectedRole.label}</h3>
                <p>{selectedRole.description}</p>
                
                {permissions.map(section => (
                  <div key={section.id} className="permission-section">
                    <div className="section-header">
                      <h4 className="section-name">{section.label}</h4>
                    </div>
                    <p className="section-description">{section.description}</p>
                    
                    <div className="permissions-grid">
                      {section.modules.map(permission => (
                        <div key={permission.id} className="permission-item">
                          <input
                            type="checkbox"
                            id={`perm-${permission.id}`}
                            className="permission-checkbox"
                            defaultChecked={permission.id <= 3}
                          />
                          <label
                            htmlFor={`perm-${permission.id}`}
                            className="permission-label"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="save-permissions">
                  <button className="save-btn" onClick={handleSavePermissions}>
                    Lưu phân quyền
                  </button>
                  
                  {saveSuccess && (
                    <div className="save-success">
                      <i className="fas fa-check-circle"></i>
                      Đã lưu phân quyền thành công
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;
