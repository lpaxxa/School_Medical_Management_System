import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import * as healthCheckupService from '../../../../../services/healthCheckupService';
import './Dashboard.css';
import { Button } from 'react-bootstrap';

// Đăng ký các components cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = ({ stats, campaignsData, onCampaignSelect, refreshData, onCreateNewCheckup }) => {
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [followupStudents, setFollowupStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách học sinh cần theo dõi và đợt khám gần đây
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const studentsRequiringFollowup = await healthCheckupService.getStudentsRequiringFollowup() || [];
        setFollowupStudents(studentsRequiringFollowup);
        
        // Lấy các đợt khám gần nhất và kiểm tra dữ liệu có tồn tại không
        if (Array.isArray(campaignsData) && campaignsData.length > 0) {
          // Sắp xếp theo ngày bắt đầu mới nhất
          const sortedCampaigns = [...campaignsData].sort((a, b) => {
            // Dùng startDate nếu có, nếu không thì dùng createdAt
            const dateA = a.startDate ? new Date(a.startDate) : (a.createdAt ? new Date(a.createdAt) : new Date());
            const dateB = b.startDate ? new Date(b.startDate) : (b.createdAt ? new Date(b.createdAt) : new Date());
            return dateB - dateA;
          }).slice(0, 5);
          
          setRecentCampaigns(sortedCampaigns);
        } else {
          setRecentCampaigns([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setFollowupStudents([]);
        setRecentCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [campaignsData]);

  // Dữ liệu cho biểu đồ trạng thái đợt khám
  const campaignStatusChart = {
    labels: ['Đang diễn ra', 'Sắp diễn ra', 'Đã hoàn thành', 'Huỷ'],
    datasets: [
      {
        data: [
          stats.activeCampaigns,
          stats.upcomingCampaigns,
          stats.completedCampaigns,
          campaignsData.filter(c => c.status === 'Huỷ').length
        ],
        backgroundColor: [
          '#4CAF50', // Xanh lá - đang diễn ra
          '#2196F3', // Xanh dương - sắp diễn ra
          '#9C27B0', // Tím - đã hoàn thành
          '#F44336'  // Đỏ - huỷ
        ],
        borderWidth: 1
      },
    ],
  };

  // Kiểm tra dữ liệu cho biểu đồ tiến độ
  const progressChart = {
    labels: Array.isArray(campaignsData) ? 
      campaignsData
        .filter(c => c.status === 'Đang diễn ra')
        .map(c => c.name && c.name.length > 25 ? c.name.substring(0, 25) + '...' : (c.name || 'Không có tên')) :
      [],
    datasets: [
      {
        label: 'Hoàn thành (%)',
        data: Array.isArray(campaignsData) ?
          campaignsData
            .filter(c => c.status === 'Đang diễn ra')
            .map(c => {
              // Kiểm tra các trường dữ liệu trước khi tính toán
              const completed = c.completedStudents || c.examinedStudents || 0;
              const total = c.totalStudents || 1; // Tránh chia cho 0
              return Math.round((completed / total) * 100);
            }) :
          [],
        backgroundColor: '#3498db',
      },
    ],
  };

  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard Khám Sức Khoẻ</h2>
      
      {/* Thống kê tổng quan */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalCampaigns}</span>
            <span className="stat-label">Tổng số đợt khám</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.activeCampaigns}</span>
            <span className="stat-label">Đang diễn ra</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon upcoming">
            <i className="fas fa-calendar-plus"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.upcomingCampaigns}</span>
            <span className="stat-label">Sắp diễn ra</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.completedCampaigns}</span>
            <span className="stat-label">Đã hoàn thành</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon followup">
            <i className="fas fa-user-md"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.followupStudents}</span>
            <span className="stat-label">Học sinh cần theo dõi</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-row">
          {/* Biểu đồ trạng thái đợt khám */}
          <div className="chart-container">
            <h3>Trạng thái đợt khám</h3>
            <div className="chart-wrapper">
              <Pie data={campaignStatusChart} />
            </div>
          </div>
          
          {/* Biểu đồ tiến độ hoàn thành */}
          <div className="chart-container progress-chart">
            <h3>Tiến độ hoàn thành đợt khám đang diễn ra</h3>
            {progressChart.labels.length > 0 ? (
              <div className="chart-wrapper bar-chart">
                <Bar data={progressChart} options={barOptions} />
              </div>
            ) : (
              <p className="no-data">Không có đợt khám nào đang diễn ra</p>
            )}
          </div>
        </div>
        
        <div className="dashboard-row">
          {/* Đợt khám gần đây */}
          <div className="recent-campaigns">
            <h3>Đợt khám gần đây</h3>
            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <>
                {recentCampaigns.length > 0 ? (
                  <table className="campaigns-table">
                    <thead>
                      <tr>
                        <th>Tên đợt khám</th>
                        <th>Ngày dự kiến</th>
                        <th>Trạng thái</th>
                        <th>Tiến độ</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCampaigns.map(campaign => (
                        <tr key={campaign.id}>
                          <td>{campaign.name || 'Không có tên'}</td>
                          <td>{campaign.scheduledDate || campaign.startDate || 'Chưa xác định'}</td>
                          <td>
                            <span className={`status-badge ${(campaign.status || '').toLowerCase().replace(' ', '-')}`}>
                              {campaign.status || 'Chưa cập nhật'}
                            </span>
                          </td>
                          <td>
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${Math.round(((campaign.completedStudents || campaign.examinedStudents || 0) / (campaign.totalStudents || 1)) * 100)}%` 
                                }}
                              ></div>
                              <span className="progress-text">
                                {campaign.completedStudents || campaign.examinedStudents || 0}/{campaign.totalStudents || 0} 
                                ({Math.round(((campaign.completedStudents || campaign.examinedStudents || 0) / (campaign.totalStudents || 1)) * 100)}%)
                              </span>
                            </div>
                          </td>
                          <td>
                            <button className="action-button view" onClick={() => onCampaignSelect(campaign)}>
                              <i className="fas fa-eye"></i> Xem
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">Chưa có đợt khám nào được tạo</p>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Học sinh cần theo dõi đặc biệt */}
        <div className="dashboard-row">
          <div className="followup-students">
            <h3>Học sinh cần theo dõi đặc biệt</h3>
            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <>
                {followupStudents && followupStudents.length > 0 ? (
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Mã học sinh</th>
                        <th>Họ và tên</th>
                        <th>Lớp</th>
                        <th>Vấn đề cần theo dõi</th>
                        <th>Ngày tái khám</th>
                        <th>Đã thông báo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {followupStudents.map((student, index) => (
                        <tr key={index}>
                          <td>{student.id || student.studentCode || 'N/A'}</td>
                          <td>{student.fullName || student.studentName || 'N/A'}</td>
                          <td>{student.class || student.className || 'N/A'}</td>
                          <td>{student.diagnosis || student.issue || 'Không có thông tin'}</td>
                          <td>{student.followupDate || 'Chưa xác định'}</td>
                          <td>
                            {(student.parentNotified || student.notifiedToParent) ? (
                              <span className="notified yes"><i className="fas fa-check-circle"></i> Đã thông báo</span>
                            ) : (
                              <span className="notified no"><i className="fas fa-times-circle"></i> Chưa thông báo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">Không có học sinh nào cần theo dõi đặc biệt</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Thêm nút tạo mới ở đây */}
      <div className="dashboard-actions">
        <Button 
          variant="primary" 
          className="create-checkup-btn"
          onClick={onCreateNewCheckup}
        >
          <i className="fas fa-plus-circle"></i> Tạo khám sức khỏe mới
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
