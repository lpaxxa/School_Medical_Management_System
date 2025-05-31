import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const VaccinationReports = ({ stats }) => {
  if (!stats) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  const coverageData = {
    labels: ['Hoàn thành', 'Đang tiến hành', 'Chưa tiêm'],
    datasets: [
      {
        data: [stats.fullyVaccinated || 0, stats.partiallyVaccinated || 0, stats.notVaccinated || 0],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="vaccination-reports">
      <div className="header-actions">
        <h3>Thống kê & Báo cáo Tiêm chủng</h3>
        <button className="btn-export">
          <i className="fas fa-file-export"></i> Xuất báo cáo
        </button>
      </div>

      <div className="report-filters">
        <div className="filter-row">
          <div className="filter-item">
            <label>Thời gian:</label>
            <select>
              <option>Tháng này</option>
              <option>Quý gần nhất</option>
              <option>Năm học 2024-2025</option>
              <option>Tất cả</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Khối lớp:</label>
            <select>
              <option>Tất cả khối</option>
              <option>Khối 6</option>
              <option>Khối 7</option>
              <option>Khối 8</option>
              <option>Khối 9</option>
              <option>Khối 10</option>
              <option>Khối 11</option>
              <option>Khối 12</option>
            </select>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h4>Tỷ lệ tiêm chủng theo trạng thái</h4>
          <div className="chart-container">
            <Pie data={coverageData} options={{
              plugins: {
                legend: {
                  position: 'bottom',
                },
              }
            }} />
          </div>
        </div>

        <div className="report-card">
          <h4>Tỷ lệ hoàn thành theo khối lớp</h4>
          <div className="chart-container">
            {/* Đây là nơi sẽ thêm biểu đồ khác khi có dữ liệu */}
            <div className="placeholder-chart">
              <p>Đang phát triển tính năng phân tích theo khối lớp</p>
            </div>
          </div>
        </div>
      </div>

      <div className="report-summary">
        <h4>Tóm tắt báo cáo</h4>
        <p>Tỷ lệ bao phủ tiêm chủng toàn trường: <strong>{stats.coveragePercentage || 0}%</strong></p>
        <p>Tổng số học sinh đã tiêm đầy đủ: <strong>{stats.fullyVaccinated || 0}</strong></p>
        <p>Tổng số học sinh chưa tiêm đầy đủ: <strong>{stats.partiallyVaccinated || 0}</strong></p>
        <p>Tổng số học sinh chưa tiêm: <strong>{stats.notVaccinated || 0}</strong></p>
      </div>
    </div>
  );
};

export default VaccinationReports;