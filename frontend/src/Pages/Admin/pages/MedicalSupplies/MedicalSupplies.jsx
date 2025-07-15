import React, { useState } from 'react';
import './MedicalSupplies.css';

const MedicalSupplies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Sample data
  const supplies = [
    {
      id: 1,
      name: 'Khẩu trang y tế',
      description: 'Khẩu trang y tế 3 lớp',
      category: 'SUPPLIES',
      unit: 'Cái',
      quantity: 496,
      expiryDate: '1/1/2026',
      status: 'Còn hàng',
      stockStatus: 'Cần theo dõi'
    },
    {
      id: 2,
      name: 'Nước rửa tay khô',
      description: 'Nước rửa tay thổ diệt khuẩn',
      category: 'SUPPLIES',
      unit: 'Chai',
      quantity: 98,
      expiryDate: '15/3/2025',
      status: 'Còn hàng',
      stockStatus: 'Đã hết hạn'
    },
    {
      id: 3,
      name: 'Băng gạc y tế',
      description: 'Băng gạc vô trùng',
      category: 'SUPPLIES',
      unit: 'Cuộn',
      quantity: 199,
      expiryDate: '1/2/2027',
      status: 'Còn hàng',
      stockStatus: 'Còn hạn'
    },
    {
      id: 4,
      name: 'Oxy già',
      description: 'Dung dịch sát trùng vết thương',
      category: 'MEDICINE',
      unit: 'Chai',
      quantity: 51,
      expiryDate: '10/4/2025',
      status: 'Còn hàng',
      stockStatus: 'Đã hết hạn'
    },
    {
      id: 5,
      name: 'Thuốc nhỏ mắt Natri Clorid 0.9%',
      description: 'Nước muối sinh lý nhỏ mắt',
      category: 'MEDICINE',
      unit: 'Lọ',
      quantity: 76,
      expiryDate: '20/5/2025',
      status: 'Còn hàng',
      stockStatus: 'Đã hết hạn'
    },
    {
      id: 6,
      name: 'Nhiệt kế điện tử',
      description: 'Nhiệt kế đo thân nhiệt',
      category: 'EQUIPMENT',
      unit: 'Cái',
      quantity: 20,
      expiryDate: '1/6/2028',
      status: 'Còn hàng',
      stockStatus: 'Còn hạn'
    }
  ];

  const stats = [
    { label: 'Tổng số loại thuốc', value: 13, color: 'blue', icon: '💊' },
    { label: 'Sắp hết hàng', value: 0, color: 'yellow', icon: '⚠️' },
    { label: 'Sắp hết hạn', value: 8, color: 'red', icon: '🏥' },
    { label: 'Loại thuốc', value: 4, color: 'gray', icon: '' }
  ];

  const filteredSupplies = supplies.filter(supply => {
    return supply.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (selectedCategory === '' || supply.category === selectedCategory) &&
           (selectedStatus === '' || supply.stockStatus === selectedStatus);
  });

  return (
    <div className="admin_ui_medical_supplies">
      {/* Header */}
      <div className="admin_ui_medical_header">
        <button className="admin_ui_back_btn">
          ← Quay lại
        </button>
        <div className="admin_ui_header_content">
          <div className="admin_ui_header_info">
            <h1>🏥 Báo cáo thuốc và vật tư y tế</h1>
            <p>Danh sách tất cả thuốc và vật tư y tế trong kho</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin_ui_stats_grid">
        {stats.map((stat, index) => (
          <div key={index} className={`admin_ui_stat_card admin_ui_stat_${stat.color}`}>
            <div className="admin_ui_stat_icon">{stat.icon}</div>
            <div className="admin_ui_stat_content">
              <div className="admin_ui_stat_value">{stat.value}</div>
              <div className="admin_ui_stat_label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin_ui_filters_section">
        <div className="admin_ui_search_box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên thuốc, loại vật tư..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin_ui_search_input"
          />
        </div>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="admin_ui_filter_select"
        >
          <option value="">Tất cả loại</option>
          <option value="SUPPLIES">Vật tư</option>
          <option value="MEDICINE">Thuốc</option>
          <option value="EQUIPMENT">Thiết bị</option>
        </select>
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="admin_ui_filter_select"
        >
          <option value="">Tất cả tình trạng</option>
          <option value="Còn hạn">Còn hạn</option>
          <option value="Cần theo dõi">Cần theo dõi</option>
          <option value="Đã hết hạn">Đã hết hạn</option>
        </select>
      </div>

      <div className="admin_ui_results_info">
        Hiển thị {filteredSupplies.length} / {supplies.length} loại thuốc
      </div>

      {/* Table */}
      <div className="admin_ui_table_container">
        <table className="admin_ui_supplies_table">
          <thead>
            <tr>
              <th>STT</th>
              <th>TÊN THUỐC</th>
              <th>LOẠI</th>
              <th>ĐƠN VỊ</th>
              <th>TỒN KHO</th>
              <th>HẾT HẠN</th>
              <th>TRẠNG THÁI KHO</th>
              <th>TRẠNG THÁI HẠN</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupplies.map((supply, index) => (
              <tr key={supply.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="admin_ui_supply_info">
                    <div className="admin_ui_supply_name">{supply.name}</div>
                    <div className="admin_ui_supply_desc">{supply.description}</div>
                  </div>
                </td>
                <td>
                  <span className={`admin_ui_category_badge admin_ui_category_${supply.category.toLowerCase()}`}>
                    {supply.category}
                  </span>
                </td>
                <td>{supply.unit}</td>
                <td>{supply.quantity}</td>
                <td>{supply.expiryDate}</td>
                <td>
                  <span className={`admin_ui_status_badge admin_ui_status_${supply.status === 'Còn hàng' ? 'available' : 'unavailable'}`}>
                    {supply.status}
                  </span>
                </td>
                <td>
                  <span className={`admin_ui_stock_badge admin_ui_stock_${supply.stockStatus === 'Còn hạn' ? 'valid' : supply.stockStatus === 'Cần theo dõi' ? 'warning' : 'expired'}`}>
                    {supply.stockStatus}
                  </span>
                </td>
                <td>
                  <button className="admin_ui_action_btn">
                    💬
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalSupplies;
