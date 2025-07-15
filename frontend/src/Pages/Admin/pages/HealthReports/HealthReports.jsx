import React, { useState } from 'react';
import './HealthReports.css';

const HealthReports = () => {
  const [selectedReportType, setSelectedReportType] = useState('student');

  const reportTypes = [
    {
      id: 'student',
      title: 'Quản lý học sinh',
      description: 'Thông kê sức khỏe học sinh',
      icon: '👨‍🎓',
      color: 'blue',
      selected: true
    },
    {
      id: 'vaccination',
      title: 'Báo cáo tiêm chủng',
      description: 'Kết quả chiến dịch tiêm chủng',
      icon: '💉',
      color: 'purple'
    },
    {
      id: 'vaccine',
      title: 'Báo cáo vaccine',
      description: 'Danh sách và thống tin vaccine',
      icon: '🩹',
      color: 'green'
    },
    {
      id: 'medicine',
      title: 'Báo cáo thuốc',
      description: 'Thống kê sử dụng thuốc',
      icon: '💊',
      color: 'orange'
    },
    {
      id: 'health_check',
      title: 'Báo cáo khám sức khỏe định kỳ',
      description: 'Thông kê khám sức khỏe định kỳ',
      icon: '🏥',
      color: 'pink'
    }
  ];

  return (
    <div className="admin_ui_health_reports">
      {/* Header */}
      <div className="admin_ui_reports_header">
        <div className="admin_ui_header_content">
          <h1>📊 Quản lý hồ sơ & Thống kê</h1>
          <p>Tạo và quản lý các báo cáo thống kê về sức khỏe học sinh và hoạt động của sự kiện y tế</p>
        </div>
        <div className="admin_ui_reports_badge">
          <span className="admin_ui_badge_count">5</span>
          <span className="admin_ui_badge_label">LOẠI BÁO CÁO</span>
        </div>
      </div>

      {/* Report Types Section */}
      <div className="admin_ui_reports_section">
        <h2>Tạo báo cáo mới</h2>
        
        <div className="admin_ui_report_types_grid">
          {reportTypes.map((type) => (
            <div 
              key={type.id}
              className={`admin_ui_report_type_card ${selectedReportType === type.id ? 'admin_ui_selected' : ''}`}
              onClick={() => setSelectedReportType(type.id)}
            >
              <div className="admin_ui_report_icon">
                {type.icon}
              </div>
              <div className="admin_ui_report_content">
                <h3>{type.title}</h3>
                <p>{type.description}</p>
              </div>
              {selectedReportType === type.id && (
                <div className="admin_ui_selected_indicator">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="admin_ui_action_section">
          <button className="admin_ui_create_report_btn">
            🔍 Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthReports;
