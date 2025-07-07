import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Card, Row, Col, Badge, Table } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import './VaccinationDashboard.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Đăng ký components cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const VaccinationDashboard = () => {
  const { 
    loading, 
    error, 
    clearError,
    fetchVaccinationRecords,
    fetchVaccines,
    fetchNotificationsByType
  } = useVaccination();
  
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalVaccinations: 0,
    pendingMonitoring: 0,
    completedVaccinations: 0,
    upcomingVaccinations: 0,
    vaccineDistribution: {},
    responseRates: {
      accepted: 0,
      rejected: 0,
      pending: 0,
      total: 0
    }
  });
  const [localLoading, setLocalLoading] = useState(true);

  // Hiển thị thông báo lỗi nếu có
  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      clearError();
    }
  }, [error, clearError]);

  // Tải dữ liệu khi component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Hàm tải dữ liệu cho dashboard
  const loadDashboardData = async () => {
    try {
      setLocalLoading(true);
      
      // Tải danh sách bản ghi tiêm chủng
      const vaccinationData = await fetchVaccinationRecords();
      console.log("Loaded vaccination data:", vaccinationData);
      setVaccinations(vaccinationData || []);
      
      // Tải danh sách vaccine
      const vaccineData = await fetchVaccines();
      console.log("Loaded vaccine data:", vaccineData);
      setVaccines(vaccineData || []);
      
      // Tải thông báo tiêm chủng
      const notificationData = await fetchNotificationsByType('VACCINATION');
      console.log("Loaded notification data:", notificationData);
      setNotifications(notificationData || []);
      
      // Tính toán các chỉ số thống kê
      calculateDashboardStats(vaccinationData || [], notificationData || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Sử dụng dữ liệu mẫu nếu API lỗi
      const mockVaccinations = [
        {
          "id": 1,
          "healthProfileId": 101,
          "studentName": "Nguyễn Văn A",
          "vaccineName": "Vắc xin COVID-19 Pfizer",
          "vaccinationDate": "2024-04-15",
          "nextDoseDate": "2025-04-15",
          "doseNumber": 1,
          "administeredBy": "Bác sĩ Nguyễn Thị B",
          "administeredAt": "Phòng y tế trường",
          "notes": "Không có phản ứng phụ",
          "parentResponse": "ACCEPTED"
        },
        {
          "id": 2,
          "healthProfileId": 102,
          "studentName": "Trần Thị C",
          "vaccineName": "Vắc xin COVID-19 Pfizer",
          "vaccinationDate": "2024-04-15",
          "nextDoseDate": "2025-04-15",
          "doseNumber": 1,
          "administeredBy": "Bác sĩ Nguyễn Thị B",
          "administeredAt": "Phòng y tế trường",
          "notes": "Không có phản ứng phụ",
          "parentResponse": "ACCEPTED"
        },
        {
          "id": 3,
          "healthProfileId": 103,
          "studentName": "Lê Văn D",
          "vaccineName": "Vắc xin COVID-19 Pfizer",
          "vaccinationDate": "2024-04-15",
          "nextDoseDate": "2025-04-15",
          "doseNumber": 1,
          "administeredBy": "Bác sĩ Nguyễn Thị B",
          "administeredAt": "Phòng y tế trường",
          "notes": "Sốt nhẹ",
          "parentResponse": "ACCEPTED"
        },
        {
          "id": 4,
          "healthProfileId": 104,
          "studentName": "Phạm Thị E",
          "vaccineName": "Vắc xin Cúm mùa",
          "vaccinationDate": "2024-03-20",
          "nextDoseDate": "2025-03-20",
          "doseNumber": 1,
          "administeredBy": "Bác sĩ Nguyễn Thị B",
          "administeredAt": "Phòng y tế trường",
          "notes": "Tiêm phòng cúm mùa thành công",
          "parentResponse": "PENDING"
        }
      ];
      
      const mockNotifications = [
        {
          id: 1,
          title: "Thông báo tiêm chủng COVID-19",
          message: "Thông báo về kế hoạch tiêm chủng vắc xin COVID-19 cho học sinh",
          senderName: "Y tá trường",
          createdAt: "2024-04-10T08:00:00",
          recipients: [
            { id: 1, receiverName: "Nguyễn Văn Hùng", studentName: "Nguyễn Văn A", studentId: 101, response: "ACCEPTED" },
            { id: 2, receiverName: "Trần Thị Mai", studentName: "Trần Thị C", studentId: 102, response: "ACCEPTED" },
            { id: 3, receiverName: "Lê Văn Hoàng", studentName: "Lê Văn D", studentId: 103, response: "REJECTED" },
            { id: 4, receiverName: "Phạm Thị Hương", studentName: "Phạm Thị E", studentId: 104, response: "PENDING" }
          ]
        }
      ];
      
      setVaccinations(mockVaccinations);
      setNotifications(mockNotifications);
      
      // Tính toán các chỉ số thống kê từ dữ liệu mẫu
      calculateDashboardStats(mockVaccinations, mockNotifications);
    } finally {
      setLocalLoading(false);
    }
  };

  // Tính toán các chỉ số thống kê từ dữ liệu
  const calculateDashboardStats = (vaccinationData, notificationData) => {
    if (!vaccinationData || !notificationData) {
      console.log("Missing data for dashboard stats calculation");
      return;
    }
    
    console.log("Calculating dashboard stats with:", { vaccinationData, notificationData });
    
    // Tổng số bản ghi tiêm chủng
    const totalVaccinations = vaccinationData.length;
    
    // Số bản ghi đã hoàn thành (không cần theo dõi - note là "Không có phản ứng phụ")
    const completedVaccinations = vaccinationData.filter(v => v.notes === 'Không có phản ứng phụ').length;
    
    // Số bản ghi cần theo dõi (chưa có ghi chú hoặc có ghi chú khác "Không có phản ứng phụ")
    const pendingMonitoring = vaccinationData.filter(v => !v.notes || v.notes.trim() === '' || 
                                                   (v.notes !== 'Không có phản ứng phụ')).length;
    
    // Số mũi tiêm sắp tới (dựa trên nextDoseDate)
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    const upcomingVaccinations = vaccinationData.filter(v => {
      if (!v.nextDoseDate) return false;
      const nextDose = new Date(v.nextDoseDate);
      return nextDose > today && nextDose < nextMonth;
    }).length;
    
    // Phân bố theo loại vaccine
    const vaccineDistribution = {};
    vaccinationData.forEach(v => {
      if (v.vaccineName) {
        vaccineDistribution[v.vaccineName] = (vaccineDistribution[v.vaccineName] || 0) + 1;
      }
    });
    
    // Tỷ lệ phản hồi từ phụ huynh (cách tính tương tự VaccinationRecordManagement.jsx)
    let allRecipients = [];
    if (notificationData && Array.isArray(notificationData)) {
      allRecipients = notificationData.flatMap(n => n.recipients || []);
    }
    
    const totalRecipients = allRecipients.length;
    const accepted = allRecipients.filter(r => r.response === 'ACCEPTED').length;
    const rejected = allRecipients.filter(r => r.response === 'REJECTED').length;
    const pending = allRecipients.filter(r => r.response === 'PENDING' || !r.response).length;
    
    console.log("Calculated stats:", {
      totalVaccinations,
      completedVaccinations,
      pendingMonitoring,
      upcomingVaccinations,
      vaccineDistribution,
      responseRates: { accepted, rejected, pending, total: totalRecipients }
    });
    
    // Cập nhật state
    setDashboardStats({
      totalVaccinations,
      pendingMonitoring,
      completedVaccinations,
      upcomingVaccinations,
      vaccineDistribution,
      responseRates: {
        accepted,
        rejected,
        pending,
        total: totalRecipients
      }
    });
  };

  // Chuẩn bị dữ liệu cho biểu đồ phân bố vaccine
  const prepareVaccineDistributionChart = () => {
    const labels = Object.keys(dashboardStats.vaccineDistribution);
    const data = labels.map(label => dashboardStats.vaccineDistribution[label]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Số lượng mũi tiêm',
          data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)',
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ tỷ lệ phản hồi
  const prepareResponseRatesChart = () => {
    const { accepted, rejected, pending } = dashboardStats.responseRates;
    
    return {
      labels: ['Đã đồng ý', 'Từ chối', 'Chờ phản hồi'],
      datasets: [
        {
          data: [accepted, rejected, pending],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',  // Xanh lá - đã đồng ý
            'rgba(255, 99, 132, 0.6)',  // Đỏ - từ chối
            'rgba(255, 205, 86, 0.6)',  // Vàng - chờ phản hồi
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

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

  // Lấy trạng thái theo ghi chú - cách thức từ PostVaccinationMonitoring.jsx
  const getStatus = (notes) => {
    if (!notes || notes.trim() === '') {
      return 'Cần theo dõi';
    }
    return notes === 'Không có phản ứng phụ' ? 'Không cần theo dõi' : 'Cần theo dõi';
  };

  // Hiển thị badge trạng thái
  const getStatusBadge = (notes) => {
    const status = getStatus(notes);
    return status === 'Không cần theo dõi' 
      ? <Badge bg="success">{status}</Badge>
      : <Badge bg="warning">{status}</Badge>;
  };

  // Lấy danh sách mũi tiêm gần đây
  const getRecentVaccinations = () => {
    return [...vaccinations]
      .sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate))
      .slice(0, 5);
  };

  // Lấy danh sách mũi tiêm cần theo dõi, theo định nghĩa của PostVaccinationMonitoring
  const getVaccinationsNeedingMonitoring = () => {
    return vaccinations
      .filter(v => !v.notes || v.notes.trim() === '' || (v.notes !== 'Không có phản ứng phụ'))
      .sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate))
      .slice(0, 5);
  };

  if (loading || localLoading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="vaccination-dashboard">
      <ToastContainer />
      <h2 className="dashboard-title">Tổng quan tiêm chủng</h2>
      
      {/* Thẻ tổng quan */}
      <div className="dashboard-summary-container">
        <Row className="g-4">
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body>
                <div className="summary-icon total">
                  <i className="fas fa-syringe"></i>
                </div>
                <div className="summary-content">
                  <h3>{dashboardStats.totalVaccinations}</h3>
                  <p>Tổng số mũi tiêm</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body>
                <div className="summary-icon completed">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="summary-content">
                  <h3>{dashboardStats.completedVaccinations}</h3>
                  <p>Đã hoàn thành</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body>
                <div className="summary-icon pending">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="summary-content">
                  <h3>{dashboardStats.pendingMonitoring}</h3>
                  <p>Cần theo dõi</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body>
                <div className="summary-icon upcoming">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="summary-content">
                  <h3>{dashboardStats.upcomingVaccinations}</h3>
                  <p>Sắp đến hạn</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Biểu đồ */}
      <div className="dashboard-charts">
        <Row className="g-4">
          <Col md={6}>
            <Card className="chart-card">
              <Card.Header>Phân bố theo loại vaccine</Card.Header>
              <Card.Body>
                <div className="chart-container">
                  {Object.keys(dashboardStats.vaccineDistribution).length > 0 ? (
                    <Bar 
                      data={prepareVaccineDistributionChart()} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: 'Số lượng mũi tiêm theo loại vaccine'
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
              <Card.Header>Tỷ lệ phản hồi từ phụ huynh</Card.Header>
              <Card.Body>
                <div className="chart-container">
                  {dashboardStats.responseRates.total > 0 ? (
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
                              label: (context) => {
                                const value = context.raw;
                                const total = dashboardStats.responseRates.total;
                                const percentage = ((value / total) * 100).toFixed(0);
                                return `${context.label}: ${value} (${percentage}%)`;
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
      </div>
      
      {/* Bảng dữ liệu */}
      <div className="dashboard-tables">
        <Row className="g-4">
          <Col md={6}>
            <Card className="table-card">
              <Card.Header>
                <i className="fas fa-history"></i> Mũi tiêm gần đây
              </Card.Header>
              <Card.Body>
                {vaccinations.length > 0 ? (
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Học sinh</th>
                        <th>Vaccine</th>
                        <th>Ngày tiêm</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRecentVaccinations().map((vaccination, index) => (
                        <tr key={`recent-${vaccination.id || index}`}>
                          <td>{vaccination.studentName || 'Chưa có thông tin'}</td>
                          <td>{vaccination.vaccineName || 'Chưa có thông tin'}</td>
                          <td>{formatDate(vaccination.vaccinationDate)}</td>
                          <td>{getStatusBadge(vaccination.notes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-info-circle"></i>
                    <p>Chưa có dữ liệu về mũi tiêm gần đây</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="table-card">
              <Card.Header>
                <i className="fas fa-exclamation-circle"></i> Cần theo dõi
              </Card.Header>
              <Card.Body>
                {getVaccinationsNeedingMonitoring().length > 0 ? (
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Học sinh</th>
                        <th>Vaccine</th>
                        <th>Ngày tiêm</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getVaccinationsNeedingMonitoring().map((vaccination, index) => (
                        <tr key={`monitoring-${vaccination.id || index}`}>
                          <td>{vaccination.studentName || 'Chưa có thông tin'}</td>
                          <td>{vaccination.vaccineName || 'Chưa có thông tin'}</td>
                          <td>{formatDate(vaccination.vaccinationDate)}</td>
                          <td>
                            <Badge bg="warning">Cần theo dõi</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-check-circle"></i>
                    <p>Không có mũi tiêm nào cần theo dõi</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default VaccinationDashboard;