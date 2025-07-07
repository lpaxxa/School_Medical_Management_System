import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import './Dashboard.css';
import { Button, Card, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import { FaProcedures, FaTasks, FaUserMd, FaPlusCircle, FaArrowRight, FaWalking, FaChartPie, FaCalendarCheck, FaUsers } from 'react-icons/fa';

// Đăng ký các components cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = ({ onCampaignSelect, onCreateNewCheckup }) => {
  const { getHealthCampaigns, getStudentsRequiringFollowup } = useHealthCheckup();
  
  const [stats, setStats] = useState(null);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [followupStudents, setFollowupStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [campaignsData, followupData] = await Promise.all([
        getHealthCampaigns(),
        getStudentsRequiringFollowup()
      ]);

      // Calculate stats on the frontend
      const ongoingCampaigns = campaignsData.filter(c => c.status === 'ONGOING');
      const totalStudentsInOngoing = ongoingCampaigns.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
      const totalConsentedInOngoing = ongoingCampaigns.reduce((sum, c) => sum + (c.consentedStudents || 0), 0);
      const totalCompletedInOngoing = ongoingCampaigns.reduce((sum, c) => sum + (c.completedCheckups || 0), 0);

      const calculatedStats = {
        totalCampaigns: campaignsData.length,
        ongoingCampaigns: ongoingCampaigns.length,
        preparingCampaigns: campaignsData.filter(c => c.status === 'PREPARING').length,
        completedCampaigns: campaignsData.filter(c => c.status === 'COMPLETED').length,
        totalStudentsInOngoingCampaigns: totalStudentsInOngoing,
        totalConsentedInOngoingCampaigns: totalConsentedInOngoing,
        totalCompletedInOngoingCampaigns: totalCompletedInOngoing,
      };
      
      setStats(calculatedStats);
      
      const sortedCampaigns = (campaignsData || [])
        .sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt))
        .slice(0, 5);
          setRecentCampaigns(sortedCampaigns);
      
      setFollowupStudents(followupData || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <h4 className="ms-3">Đang tải dữ liệu...</h4>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const campaignStatusChart = {
    labels: ['Đang diễn ra', 'Sắp diễn ra', 'Đã hoàn thành'],
    datasets: [{
      data: [stats?.ongoingCampaigns || 0, stats?.preparingCampaigns || 0, stats?.completedCampaigns || 0],
      backgroundColor: ['#28a745', '#17a2b8', '#6c757d'],
      hoverBackgroundColor: ['#218838', '#138496', '#5a6268']
    }],
  };

  const consentProgressChart = {
    labels: ['Đã đồng ý', 'Chờ đồng ý'],
    datasets: [{
        data: [
        stats?.totalConsentedInOngoingCampaigns || 0, 
        (stats?.totalStudentsInOngoingCampaigns || 0) - (stats?.totalConsentedInOngoingCampaigns || 0)
      ],
      backgroundColor: ['#007bff', '#e9ecef'],
      hoverBackgroundColor: ['#0069d9', '#d6d8db']
    }]
  };
  
  const checkupProgressChart = {
    labels: ['Đã khám', 'Chưa khám'],
    datasets: [{
      data: [
        stats?.totalCompletedInOngoingCampaigns || 0,
        (stats?.totalConsentedInOngoingCampaigns || 0) - (stats?.totalCompletedInOngoingCampaigns || 0)
      ],
      backgroundColor: ['#fd7e14', '#e9ecef'],
      hoverBackgroundColor: ['#e36a00', '#d6d8db']
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const renderProgress = (completed, total) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
        <span className="progress-text">{completed}/{total} ({percentage}%)</span>
      </div>
    );
  };

  return (
    <div className="health-dashboard">
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <h2 className="dashboard-title">Tổng quan Khám sức khỏe</h2>
        </Col>
        <Col md={4} className="text-md-end">
          <Button variant="primary" onClick={onCreateNewCheckup}>
            <FaPlusCircle className="me-2" /> Tạo đợt khám mới
          </Button>
        </Col>
      </Row>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}><Card className="stat-card ongoing"><Card.Body><FaTasks size={30} /><div className="stat-info"><h4>{stats?.ongoingCampaigns}</h4><span>Đang diễn ra</span></div></Card.Body></Card></Col>
        <Col md={3}><Card className="stat-card preparing"><Card.Body><FaWalking size={30} /><div className="stat-info"><h4>{stats?.preparingCampaigns}</h4><span>Sắp diễn ra</span></div></Card.Body></Card></Col>
        <Col md={3}><Card className="stat-card students"><Card.Body><FaUsers size={30} /><div className="stat-info"><h4>{stats?.totalStudentsInOngoingCampaigns}</h4><span>Tổng số HS</span></div></Card.Body></Card></Col>
        <Col md={3}><Card className="stat-card followup"><Card.Body><FaUserMd size={30} /><div className="stat-info"><h4>{followupStudents.length}</h4><span>Cần theo dõi</span></div></Card.Body></Card></Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Header as="h5"><FaChartPie className="me-2"/>Trạng thái các đợt khám</Card.Header>
            <Card.Body><div className="chart-wrapper"><Pie data={campaignStatusChart} options={chartOptions} /></div></Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Header as="h5"><FaChartPie className="me-2"/>Tiến độ đồng ý (Đợt đang diễn ra)</Card.Header>
            <Card.Body><div className="chart-wrapper"><Pie data={consentProgressChart} options={chartOptions} /></div></Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Header as="h5"><FaChartPie className="me-2"/>Tiến độ khám (Đợt đang diễn ra)</Card.Header>
            <Card.Body><div className="chart-wrapper"><Pie data={checkupProgressChart} options={chartOptions} /></div></Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lists Row */}
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header as="h5">Đợt khám gần đây</Card.Header>
            <Card.Body>
              <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Tên đợt khám</th>
                    <th>Ngày bắt đầu</th>
                        <th>Trạng thái</th>
                    <th>Tiến độ khám</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                  {recentCampaigns.map(c => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{new Date(c.startDate).toLocaleDateString('vi-VN')}</td>
                      <td><span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status}</span></td>
                      <td>{renderProgress(c.completedCheckups, c.consentedStudents)}</td>
                      <td>
                        <Button variant="link" onClick={() => onCampaignSelect(c)}>
                          Xem chi tiết <FaArrowRight />
                        </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
