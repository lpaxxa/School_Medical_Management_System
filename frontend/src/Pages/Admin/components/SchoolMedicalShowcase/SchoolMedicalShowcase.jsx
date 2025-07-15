import React, { useState } from 'react';
import './SchoolMedicalShowcase.css';
import MedicalSupplies from '../../pages/MedicalSupplies/MedicalSupplies';
import HealthReports from '../../pages/HealthReports/HealthReports';
import HealthCheckNotification from '../../pages/HealthCheckNotification/HealthCheckNotification';
import SupplyDetailModal from '../SupplyDetailModal/SupplyDetailModal';

const SchoolMedicalShowcase = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);

  // Sample supply data for modal
  const sampleSupply = {
    id: 1,
    name: 'Khẩu trang y tế',
    description: 'Khẩu trang y tế 3 lớp',
    category: 'SUPPLIES',
    unit: 'Cái',
    quantity: 496,
    expiryDate: '1/1/2026',
    status: 'Còn hàng',
    stockStatus: 'Cần theo dõi'
  };

  const showcaseItems = [
    {
      id: 'medical-supplies',
      title: '🏥 Báo cáo thuốc và vật tư y tế',
      description: 'Quản lý danh sách thuốc, vật tư y tế với thống kê chi tiết',
      features: ['Thống kê tồn kho', 'Theo dõi hạn sử dụng', 'Phân loại vật tư', 'Tìm kiếm và lọc'],
      color: 'blue'
    },
    {
      id: 'health-reports',
      title: '📊 Quản lý hồ sơ & Thống kê',
      description: 'Tạo và quản lý các báo cáo thống kê về sức khỏe học sinh',
      features: ['5 loại báo cáo', 'Giao diện hiện đại', 'Dễ dàng tạo báo cáo', 'Theo dõi tiến độ'],
      color: 'purple'
    },
    {
      id: 'health-notification',
      title: '📢 Thông báo kiểm tra sức khỏe',
      description: 'Quản lý thông báo và theo dõi phản hồi từ phụ huynh',
      features: ['Theo dõi trạng thái', 'Thống kê phản hồi', 'Quản lý người nhận', 'Báo cáo chi tiết'],
      color: 'green'
    },
    {
      id: 'supply-modal',
      title: '🔍 Chi tiết thuốc và vật tư',
      description: 'Modal hiển thị thông tin chi tiết về thuốc và vật tư y tế',
      features: ['Thông tin cơ bản', 'Tình trạng tồn kho', 'Ngày hết hạn', 'Cảnh báo thông minh'],
      color: 'orange'
    }
  ];

  const handleViewChange = (viewId) => {
    if (viewId === 'supply-modal') {
      setSelectedSupply(sampleSupply);
      setIsModalOpen(true);
    } else {
      setCurrentView(viewId);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'medical-supplies':
        return <MedicalSupplies />;
      case 'health-reports':
        return <HealthReports />;
      case 'health-notification':
        return <HealthCheckNotification />;
      default:
        return (
          <div className="admin_ui_showcase_overview">
            <div className="admin_ui_showcase_header">
              <h1>🏫 School Medical Management System</h1>
              <p>Hệ thống quản lý y tế học đường với thiết kế hiện đại và giao diện thân thiện</p>
            </div>

            <div className="admin_ui_showcase_grid">
              {showcaseItems.map((item) => (
                <div 
                  key={item.id}
                  className={`admin_ui_showcase_card admin_ui_showcase_${item.color}`}
                  onClick={() => handleViewChange(item.id)}
                >
                  <div className="admin_ui_showcase_card_header">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  
                  <div className="admin_ui_showcase_features">
                    <h4>✨ Tính năng nổi bật:</h4>
                    <ul>
                      {item.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="admin_ui_showcase_action">
                    <button className="admin_ui_showcase_btn">
                      Xem Demo →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin_ui_showcase_info">
              <div className="admin_ui_info_card">
                <h3>🎨 Thiết kế Blue Theme</h3>
                <p>Chuyển từ màu tím sang màu xanh dương phù hợp với môi trường y tế học đường</p>
                <div className="admin_ui_color_palette">
                  <div className="admin_ui_color_item" style={{background: '#3b82f6'}}>Primary</div>
                  <div className="admin_ui_color_item" style={{background: '#2563eb'}}>Secondary</div>
                  <div className="admin_ui_color_item" style={{background: '#1d4ed8'}}>Accent</div>
                  <div className="admin_ui_color_item" style={{background: '#1e40af'}}>Dark</div>
                </div>
              </div>
              
              <div className="admin_ui_info_card">
                <h3>🚀 Tính năng mới</h3>
                <ul>
                  <li>✅ Header gộp vào Sidebar</li>
                  <li>✅ Blue color scheme</li>
                  <li>✅ Responsive design</li>
                  <li>✅ Modern UI components</li>
                  <li>✅ Interactive modals</li>
                  <li>✅ Data visualization</li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin_ui_school_medical_showcase">
      {currentView !== 'overview' && (
        <div className="admin_ui_showcase_nav">
          <button 
            className="admin_ui_back_to_overview"
            onClick={() => setCurrentView('overview')}
          >
            ← Quay lại tổng quan
          </button>
        </div>
      )}
      
      {renderCurrentView()}
      
      <SupplyDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supply={selectedSupply}
      />
    </div>
  );
};

export default SchoolMedicalShowcase;
