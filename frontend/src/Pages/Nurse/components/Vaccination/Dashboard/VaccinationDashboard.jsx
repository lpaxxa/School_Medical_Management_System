import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import './VaccinationDashboard.css';

// Đăng ký components cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const VaccinationDashboard = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Dữ liệu cho biểu đồ tỷ lệ tiêm chủng
  const pieData = {
    labels: ['Đã tiêm đầy đủ', 'Chưa tiêm đầy đủ', 'Chưa tiêm'],
    datasets: [
      {
        data: [stats.fullyVaccinated, stats.partiallyVaccinated, stats.notVaccinated],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        hoverBackgroundColor: ['#388e3c', '#f57c00', '#d32f2f'],
        borderWidth: 0,
      },
    ],
  };

  // Dữ liệu cho biểu đồ số lượng tiêm chủng theo tháng
  const barData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Số mũi tiêm',
        data: stats.vaccinationsByMonth || [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  // Kiểm tra và định dạng ngày hợp lệ
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date) ? "Chưa có ngày" : date.toLocaleDateString('vi-VN');
    } catch {
      return "Chưa có ngày";
    }
  };

  // Hàm tính số ngày trước khi hết hạn
  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="vaccination-dashboard">
      <div className="dashboard-header">
        <h2>Tổng quan tiêm chủng</h2>
        <p>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-syringe"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalVaccinations || 0}</h3>
            <p>Tổng số mũi tiêm</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon vaccinated">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.fullyVaccinated || 0}</h3>
            <p>Học sinh đã tiêm đầy đủ</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon unvaccinated">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.notVaccinated || 0}</h3>
            <p>Học sinh chưa tiêm</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon coverage">
            <i className="fas fa-chart-pie"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.coveragePercentage || 0}%</h3>
            <p>Tỷ lệ bao phủ</p>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Tỷ lệ tiêm chủng</h3>
          <div className="chart-wrapper">
            <Pie data={pieData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = Math.round((value / total) * 100);
                      return `${label}: ${value} học sinh (${percentage}%)`;
                    }
                  }
                }
              }}} />
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Số lượng tiêm chủng theo tháng</h3>
          <div className="chart-wrapper">
            <Bar data={barData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Số mũi tiêm'
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      <div className="upcoming-vaccinations">
        <h3>Mũi tiêm sắp đến hạn</h3>
        <table className="upcoming-table">
          <thead>
            <tr>
              <th>Học sinh</th>
              <th>Lớp</th>
              <th>Vaccine</th>
              <th>Mũi số</th>
              <th>Ngày dự kiến</th>
            </tr>
          </thead>
          <tbody>
            {stats.upcomingVaccinations && stats.upcomingVaccinations.length > 0 ? (
              stats.upcomingVaccinations.map((vaccination, index) => (
                <tr key={`upcoming-${index}`}>
                  <td>{vaccination.studentName}</td>
                  <td>{vaccination.className}</td>
                  <td>{vaccination.vaccineName}</td>
                  <td>{vaccination.dose}</td>
                  <td>{formatDate(vaccination.scheduledDate)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">Không có mũi tiêm nào sắp đến hạn</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Thêm mục mũi tiêm sắp hết hạn */}
      <div className="expiring-vaccinations">
        <h3>Mũi tiêm sắp hết hạn</h3>
        <table className="expiring-table">
          <thead>
            <tr>
              <th>Vaccine</th>
              <th>Lô</th>
              <th>Số lượng còn lại</th>
              <th>Ngày hết hạn</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {stats.expiringVaccines && stats.expiringVaccines.length > 0 ? (
              stats.expiringVaccines.map((vaccine, index) => (
                <tr key={`expiring-${index}`}>
                  <td>{vaccine.name}</td>
                  <td>{vaccine.batchNumber}</td>
                  <td>{vaccine.remainingDoses}</td>
                  <td>{formatDate(vaccine.expiryDate)}</td>
                  <td>
                    <span className={`status-badge ${getDaysUntilExpiry(vaccine.expiryDate) <= 30 ? 'critical' : 'warning'}`}>
                      {getDaysUntilExpiry(vaccine.expiryDate) <= 30 ? 'Gấp' : 'Sắp hết hạn'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">Không có vaccine nào sắp hết hạn</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VaccinationDashboard;