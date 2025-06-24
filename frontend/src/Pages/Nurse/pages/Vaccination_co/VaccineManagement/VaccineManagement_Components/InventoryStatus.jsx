import React, { useState, useEffect } from 'react';
import vaccinationService from '../../../../../../services/APINurse/vaccinationService';
import './InventoryStatus.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title
);

const InventoryStatus = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState({
    vaccines: [],
    totalVaccines: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    totalBatches: 0
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const data = await vaccinationService.getVaccineInventoryStatus();
      setInventoryData(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load inventory data:", err);
      setError("Không thể tải dữ liệu tồn kho. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Data for the pie chart showing inventory status
  const statusPieData = {
    labels: ['Đủ hàng', 'Sắp hết', 'Hết hàng'],
    datasets: [
      {
        data: [
          inventoryData.vaccines.length - inventoryData.lowStockCount - inventoryData.outOfStockCount,
          inventoryData.lowStockCount,
          inventoryData.outOfStockCount
        ],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
        borderColor: ['#388E3C', '#FFA000', '#D32F2F'],
        borderWidth: 1,
      },
    ],
  };

  // Data for the bar chart showing top vaccines by quantity
  const topVaccinesData = {
    labels: inventoryData.vaccines.slice(0, 10).map(v => v.code),
    datasets: [
      {
        label: 'Số lượng hiện có',
        data: inventoryData.vaccines.slice(0, 10).map(v => v.quantity),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Mức tồn kho tối thiểu',
        data: inventoryData.vaccines.slice(0, 10).map(v => v.minStockLevel),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      }
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Vaccine theo số lượng',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng'
        }
      }
    }
  };

  return (
    <div className="inventory-status">
      <div className="section-header">
        <h2>Trạng thái tồn kho vaccine</h2>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchInventoryData}>
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
          <button className="btn-export">
            <i className="fas fa-file-export"></i> Xuất báo cáo
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu tồn kho...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchInventoryData}>
            Thử lại
          </button>
        </div>
      ) : (
        <div className="inventory-container">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">
                <i className="fas fa-syringe"></i>
              </div>
              <div className="card-content">
                <h3>Tổng số loại vaccine</h3>
                <span className="card-value">{inventoryData.totalVaccines}</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <i className="fas fa-cubes"></i>
              </div>
              <div className="card-content">
                <h3>Tổng số lô</h3>
                <span className="card-value">{inventoryData.totalBatches}</span>
              </div>
            </div>
            
            <div className="summary-card warning">
              <div className="card-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="card-content">
                <h3>Sắp hết hàng</h3>
                <span className="card-value">{inventoryData.lowStockCount}</span>
              </div>
            </div>
            
            <div className="summary-card danger">
              <div className="card-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="card-content">
                <h3>Hết hàng</h3>
                <span className="card-value">{inventoryData.outOfStockCount}</span>
              </div>
            </div>
            
            <div className="summary-card warning">
              <div className="card-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="card-content">
                <h3>Sắp hết hạn</h3>
                <span className="card-value">{inventoryData.expiringSoonCount}</span>
              </div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container pie">
              <h3>Trạng thái tồn kho</h3>
              <div className="pie-chart-wrapper">
                <Pie data={statusPieData} />
              </div>
            </div>
            
            <div className="chart-container bar">
              <h3>Top 10 vaccine</h3>
              <div className="bar-chart-wrapper">
                <Bar data={topVaccinesData} options={barOptions} />
              </div>
            </div>
          </div>
          
          {/* Inventory Table */}
          <div className="inventory-table-section">
            <h3>Chi tiết tồn kho</h3>
            <div className="search-controls">
              <input 
                type="text" 
                placeholder="Tìm kiếm vaccine..." 
                className="search-input"
              />
              <select className="filter-select">
                <option value="all">Tất cả trạng thái</option>
                <option value="inStock">Đủ hàng</option>
                <option value="lowStock">Sắp hết hàng</option>
                <option value="outOfStock">Hết hàng</option>
              </select>
            </div>
            
            <div className="table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên vaccine</th>
                    <th>Số lượng</th>
                    <th>Tồn kho tối thiểu</th>
                    <th>Trạng thái</th>
                    <th>Số lô</th>
                    <th>Gần nhất hết hạn</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.vaccines.map(vaccine => (
                    <tr key={vaccine.id} className={
                      vaccine.quantity === 0 ? 'out-of-stock' : 
                      vaccine.quantity < vaccine.minStockLevel ? 'low-stock' : ''
                    }>
                      <td>{vaccine.code}</td>
                      <td>{vaccine.name}</td>
                      <td>
                        <div className="stock-indicator">
                          <div className="stock-bar">
                            <div 
                              className="stock-level" 
                              style={{ 
                                width: `${Math.min(100, (vaccine.quantity / (vaccine.minStockLevel * 2)) * 100)}%`,
                                backgroundColor: 
                                  vaccine.quantity === 0 ? '#F44336' : 
                                  vaccine.quantity < vaccine.minStockLevel ? '#FFC107' : 
                                  '#4CAF50'
                              }} 
                            ></div>
                          </div>
                          <span className="stock-value">{vaccine.quantity}</span>
                        </div>
                      </td>
                      <td>{vaccine.minStockLevel}</td>
                      <td>
                        {vaccine.quantity === 0 && (
                          <span className="status-badge out">
                            <i className="fas fa-times-circle"></i> Hết hàng
                          </span>
                        )}
                        {vaccine.quantity > 0 && vaccine.quantity < vaccine.minStockLevel && (
                          <span className="status-badge low">
                            <i className="fas fa-exclamation-triangle"></i> Sắp hết
                          </span>
                        )}
                        {vaccine.quantity >= vaccine.minStockLevel && (
                          <span className="status-badge ok">
                            <i className="fas fa-check-circle"></i> Đủ hàng
                          </span>
                        )}
                      </td>
                      <td>{vaccine.batchCount || 0}</td>
                      <td>
                        {vaccine.nearestExpiry ? (
                          <span className={`expiry-date ${
                            new Date(vaccine.nearestExpiry) < new Date(Date.now() + 30*24*60*60*1000)
                              ? 'soon-expiry'
                              : ''
                          }`}>
                            {new Date(vaccine.nearestExpiry).toLocaleDateString('vi-VN')}
                            {new Date(vaccine.nearestExpiry) < new Date(Date.now() + 30*24*60*60*1000) && (
                              <i className="fas fa-exclamation-circle"></i>
                            )}
                          </span>
                        ) : '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryStatus;
