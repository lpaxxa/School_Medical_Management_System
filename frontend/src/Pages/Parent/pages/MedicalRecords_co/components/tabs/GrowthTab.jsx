import React from 'react';
import { FaInfoCircle, FaChartLine } from 'react-icons/fa';

const GrowthTab = ({ studentId }) => {
  return (
    <div className="growth-panel">
      <h3>Biểu đồ tăng trưởng</h3>
      
      {/* Phần này sẽ được cập nhật khi có dữ liệu tăng trưởng */}
      <div className="no-data-message">
        <FaInfoCircle />
        <h4>Chưa có thông tin tăng trưởng</h4>
        <p>
          Học sinh chưa có thông tin tăng trưởng trong hệ thống.
        </p>
        <p>
          Các dữ liệu sẽ được cập nhật sau mỗi đợt kiểm tra định kỳ tại
          trường.
        </p>
      </div>
      
      {/* Khi có dữ liệu, phần này sẽ hiển thị biểu đồ */}
      <div className="growth-chart-placeholder">
        <FaChartLine className="chart-icon" />
        <p>Biểu đồ tăng trưởng đang được phát triển</p>
      </div>
    </div>
  );
};

export default GrowthTab;