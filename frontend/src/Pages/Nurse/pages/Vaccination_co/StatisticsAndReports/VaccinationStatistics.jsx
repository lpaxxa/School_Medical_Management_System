import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Card, Row, Col, Button, Table, Form, Alert } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import './VaccinationStatistics.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const VaccinationStatistics = () => {
  const { 
    loading, 
    error, 
    fetchVaccinationRecords,
    fetchVaccines,
    fetchNotificationsByType
  } = useVaccination();
  
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('all'); // all, year, month
  const [localLoading, setLocalLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVaccinations: 0,
    completedVaccinations: 0,
    pendingVaccinations: 0,
    vaccineDistribution: {},
    responseRates: {
      accepted: 0,
      rejected: 0,
      pending: 0,
      total: 0
    },
    monthlyData: [],
    upcomingVaccinations: []
  });

  useEffect(() => {
    fetchStatistics();
  }, [selectedTimeFrame]);

  const fetchStatistics = async () => {
    try {
      setLocalLoading(true);
      
      // Fetch vaccination records
      const vaccinationData = await fetchVaccinationRecords();
      setVaccinations(vaccinationData || []);
      
      // Fetch vaccines
      const vaccineData = await fetchVaccines();
      setVaccines(vaccineData || []);
      
      // Fetch notifications
      const notificationData = await fetchNotificationsByType('VACCINATION');
      setNotifications(notificationData || []);
      
      // Calculate statistics
      calculateStatistics(vaccinationData, notificationData);
    } catch (err) {
      console.error("Failed to load statistics:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  const calculateStatistics = (vaccinationData, notificationData) => {
    if (!vaccinationData || !notificationData) return;
    
    // Filter data based on selected time frame
    const filteredData = filterDataByTimeFrame(vaccinationData);
    
    // Total vaccinations
    const totalVaccinations = filteredData.length;
    
    // Completed vaccinations (Không có phản ứng phụ - dựa trên logic từ PostVaccinationMonitoring)
    const completedVaccinations = filteredData.filter(v => v.notes === 'Không có phản ứng phụ').length;
    
    // Pending vaccinations (cần theo dõi - không có ghi chú hoặc có ghi chú khác "Không có phản ứng phụ")
    const pendingVaccinations = filteredData.filter(v => !v.notes || v.notes.trim() === '' || 
                                                   (v.notes !== 'Không có phản ứng phụ')).length;
    
    // Vaccine distribution
    const vaccineDistribution = {};
    filteredData.forEach(v => {
      if (v.vaccineName) {
        vaccineDistribution[v.vaccineName] = (vaccineDistribution[v.vaccineName] || 0) + 1;
      }
    });
    
    // Response rates from parents - cách tính tương tự VaccinationRecordManagement.jsx
    const allRecipients = notificationData.flatMap(n => n.recipients || []);
    const totalRecipients = allRecipients.length;
    const accepted = allRecipients.filter(r => r.response === 'ACCEPTED').length;
    const rejected = allRecipients.filter(r => r.response === 'REJECTED').length;
    const pending = allRecipients.filter(r => r.response === 'PENDING' || !r.response).length;
    
    // Monthly data for trends
    const monthlyData = getMonthlyData(filteredData);
    
    // Upcoming vaccinations (next dose within 30 days)
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    const upcomingVaccinations = filteredData
      .filter(v => {
        if (!v.nextDoseDate) return false;
        const nextDose = new Date(v.nextDoseDate);
        return nextDose > today && nextDose < nextMonth;
      })
      .map(v => ({
        ...v,
        daysRemaining: Math.ceil((new Date(v.nextDoseDate) - today) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
    
    // Update stats state
    setStats({
      totalVaccinations,
      completedVaccinations,
      pendingVaccinations,
      vaccineDistribution,
      responseRates: {
        accepted,
        rejected,
        pending,
        total: totalRecipients
      },
      monthlyData,
      upcomingVaccinations
    });
  };

  // Lấy trạng thái theo ghi chú - cách thức từ PostVaccinationMonitoring.jsx
  const getStatus = (notes) => {
    if (!notes || notes.trim() === '') {
      return 'Cần theo dõi';
    }
    return notes === 'Không có phản ứng phụ' ? 'Không cần theo dõi' : 'Cần theo dõi';
  };

  const filterDataByTimeFrame = (data) => {
    if (selectedTimeFrame === 'all') return data;
    
    const today = new Date();
    const startDate = new Date();
    
    if (selectedTimeFrame === 'year') {
      startDate.setMonth(0); // January
      startDate.setDate(1);
    } else if (selectedTimeFrame === 'month') {
      startDate.setDate(1);
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.vaccinationDate);
      return itemDate >= startDate && itemDate <= today;
    });
  };

  const getMonthlyData = (data) => {
    const monthlyStats = {};
    
    // Initialize months
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    months.forEach(month => {
      monthlyStats[month] = 0;
    });
    
    // Count vaccinations by month
    data.forEach(item => {
      if (item.vaccinationDate) {
        const month = item.vaccinationDate.split('-')[1]; // Extract month from YYYY-MM-DD
        if (monthlyStats[month] !== undefined) {
          monthlyStats[month]++;
        }
      }
    });
    
    return Object.entries(monthlyStats).map(([month, count]) => ({
      month,
      count
    }));
  };

  const exportReport = async (reportType) => {
    try {
      setLocalLoading(true);
      
      // Prepare data for export
      let exportData;
      
      switch (reportType) {
        case 'summary':
          exportData = {
            totalVaccinations: stats.totalVaccinations,
            completedVaccinations: stats.completedVaccinations,
            pendingVaccinations: stats.pendingVaccinations,
            acceptedRate: stats.responseRates.accepted,
            rejectedRate: stats.responseRates.rejected,
            pendingRate: stats.responseRates.pending,
            timeFrame: selectedTimeFrame
          };
          break;
        case 'detailed':
          exportData = vaccinations.map(v => ({
            id: v.id,
            studentName: v.studentName,
            vaccineName: v.vaccineName,
            vaccinationDate: v.vaccinationDate,
            nextDoseDate: v.nextDoseDate,
            doseNumber: v.doseNumber,
            administeredBy: v.administeredBy,
            notes: v.notes,
            status: getStatus(v.notes)
          }));
          break;
        case 'upcoming':
          exportData = stats.upcomingVaccinations.map(v => ({
            id: v.id,
            studentName: v.studentName,
            vaccineName: v.vaccineName,
            nextDoseDate: v.nextDoseDate,
            daysRemaining: v.daysRemaining
          }));
          break;
        default:
          exportData = {};
      }
      
      // In a real application, we would send this data to an API endpoint for export
      // For now, we'll just log it and show a success message
      console.log(`Exporting ${reportType} report:`, exportData);
      
      // Simulate download
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `vaccination_${reportType}_report_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Xuất báo cáo thành công!');
    } catch (err) {
      console.error('Failed to export report:', err);
      alert('Không thể xuất báo cáo. Vui lòng thử lại sau.');
    } finally {
      setLocalLoading(false);
    }
  };

  // Prepare data for the vaccination status pie chart
  const prepareStatusChart = () => {
    return {
      labels: ['Đã hoàn thành', 'Đang theo dõi'],
      datasets: [
        {
          data: [stats.completedVaccinations, stats.pendingVaccinations],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 205, 86, 0.6)'],
          borderColor: ['rgb(75, 192, 192)', 'rgb(255, 205, 86)'],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for vaccine distribution chart
  const prepareVaccineDistributionChart = () => {
    const labels = Object.keys(stats.vaccineDistribution);
    const data = labels.map(label => stats.vaccineDistribution[label]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Số lượng mũi tiêm',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for response rates chart
  const prepareResponseRatesChart = () => {
    const { accepted, rejected, pending } = stats.responseRates;
    
    return {
      labels: ['Đã đồng ý', 'Từ chối', 'Chờ phản hồi'],
      datasets: [
        {
          data: [accepted, rejected, pending],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for monthly trends chart
  const prepareMonthlyTrendsChart = () => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    
    const labels = stats.monthlyData.map(item => monthNames[parseInt(item.month) - 1]);
    const data = stats.monthlyData.map(item => item.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Số mũi tiêm',
          data,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading || localLoading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <Button variant="primary" onClick={fetchStatistics}>
          Thử lại
        </Button>
      </Alert>
    );
  }

  return (
    <div className="vaccination-statistics">
      <div className="section-header">
        <div className="header-title">
          <h2>Thống kê và Báo cáo</h2>
          <p className="subtitle">Phân tích dữ liệu tiêm chủng và xuất báo cáo</p>
        </div>
        
        <div className="header-actions">
          <Form.Select 
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value)}
            className="time-frame-selector"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="year">Năm hiện tại</option>
            <option value="month">Tháng hiện tại</option>
          </Form.Select>
          
          <Button variant="primary" className="export-btn" onClick={() => exportReport('summary')}>
            <i className="fas fa-download"></i> Xuất báo cáo
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <Row className="g-4">
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <i className="fas fa-syringe"></i>
                </div>
                <div className="stat-content">
                  <h3>Tổng số mũi tiêm</h3>
                  <span className="stat-value">{stats.totalVaccinations}</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon completed">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-content">
                  <h3>Đã hoàn thành</h3>
                  <span className="stat-value">{stats.completedVaccinations}</span>
                  <span className="stat-percentage">
                    {stats.totalVaccinations > 0 ? 
                      `(${Math.round((stats.completedVaccinations / stats.totalVaccinations) * 100)}%)` : 
                      '(0%)'}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon pending">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-content">
                  <h3>Đang theo dõi</h3>
                  <span className="stat-value">{stats.pendingVaccinations}</span>
                  <span className="stat-percentage">
                    {stats.totalVaccinations > 0 ? 
                      `(${Math.round((stats.pendingVaccinations / stats.totalVaccinations) * 100)}%)` : 
                      '(0%)'}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon upcoming">
                  <i className="fas fa-calendar-day"></i>
                </div>
                <div className="stat-content">
                  <h3>Sắp đến hạn</h3>
                  <span className="stat-value">{stats.upcomingVaccinations.length}</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Charts Section */}
      <div className="charts-section">
        <Row className="g-4">
          <Col md={6}>
            <Card className="chart-card">
              <Card.Header>Trạng thái tiêm chủng</Card.Header>
              <Card.Body>
                <div className="chart-container">
                  {stats.totalVaccinations > 0 ? (
                    <Pie 
                      data={prepareStatusChart()} 
                      options={{
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
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="no-data-message">
                      <i className="fas fa-info-circle"></i>
                      <p>Chưa có dữ liệu về trạng thái tiêm chủng</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="chart-card">
              <Card.Header>Tỷ lệ phản hồi từ phụ huynh</Card.Header>
              <Card.Body>
                <div className="chart-container">
                  {stats.responseRates.total > 0 ? (
                    <Pie 
                      data={prepareResponseRatesChart()} 
                      options={{
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
                                const total = stats.responseRates.total;
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="no-data-message">
                      <i className="fas fa-info-circle"></i>
                      <p>Chưa có dữ liệu về phản hồi từ phụ huynh</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="g-4 mt-2">
          <Col md={6}>
            <Card className="chart-card">
              <Card.Header>Phân bố theo loại vaccine</Card.Header>
              <Card.Body>
                <div className="chart-container">
                  {Object.keys(stats.vaccineDistribution).length > 0 ? (
                    <Bar 
                      data={prepareVaccineDistributionChart()} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false,
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="no-data-message">
                      <i className="fas fa-info-circle"></i>
                      <p>Chưa có dữ liệu về phân bố vaccine</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="chart-card">
              <Card.Header>Xu hướng tiêm chủng theo tháng</Card.Header>
              <Card.Body>
                <div className="chart-container">
                  {stats.monthlyData.some(item => item.count > 0) ? (
                    <Bar 
                      data={prepareMonthlyTrendsChart()} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false,
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="no-data-message">
                      <i className="fas fa-info-circle"></i>
                      <p>Chưa có dữ liệu về xu hướng tiêm chủng theo tháng</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Upcoming Vaccinations */}
      <Card className="mt-4">
        <Card.Header>
          <i className="fas fa-calendar-alt"></i> Mũi tiêm sắp đến hạn
        </Card.Header>
        <Card.Body>
          {stats.upcomingVaccinations.length > 0 ? (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Vaccine</th>
                  <th>Ngày hiện tại</th>
                  <th>Ngày tiêm tiếp theo</th>
                  <th>Còn lại</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingVaccinations.map((vaccination, index) => (
                  <tr key={`upcoming-${vaccination.id || index}`}>
                    <td>{vaccination.studentName || 'Chưa có thông tin'}</td>
                    <td>{vaccination.vaccineName || 'Chưa có thông tin'}</td>
                    <td>{formatDate(vaccination.vaccinationDate)}</td>
                    <td>{formatDate(vaccination.nextDoseDate)}</td>
                    <td>
                      <span className={`days-remaining ${vaccination.daysRemaining <= 7 ? 'urgent' : 'normal'}`}>
                        {vaccination.daysRemaining} ngày
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="no-data-message">
              <i className="fas fa-check-circle"></i>
              <p>Không có mũi tiêm nào sắp đến hạn trong thời gian này</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Export Options */}
      <Card className="mt-4">
        <Card.Header>
          <i className="fas fa-file-export"></i> Xuất báo cáo
        </Card.Header>
        <Card.Body>
          <div className="export-buttons">
            <Button 
              variant="outline-primary" 
              className="export-option-btn me-2" 
              onClick={() => exportReport('summary')}
            >
              <i className="fas fa-file-csv"></i>
              <span>Báo cáo tổng hợp</span>
            </Button>
            
            <Button 
              variant="outline-primary" 
              className="export-option-btn me-2" 
              onClick={() => exportReport('detailed')}
            >
              <i className="fas fa-file-csv"></i>
              <span>Báo cáo chi tiết</span>
            </Button>
            
            <Button 
              variant="outline-primary" 
              className="export-option-btn" 
              onClick={() => exportReport('upcoming')}
            >
              <i className="fas fa-file-csv"></i>
              <span>Danh sách tiêm chủng sắp tới</span>
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VaccinationStatistics;
