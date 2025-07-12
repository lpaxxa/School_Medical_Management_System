import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import CheckupDetailModal from '../ScheduleConsultation/CheckupDetailModal';
import './Dashboard.css';
import { Button, Card, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import {
  FaNotesMedical, FaTasks, FaUserMd, FaPlusCircle, FaArrowRight,
  FaWalking, FaChartPie, FaUsers, FaExclamationTriangle, FaStethoscope, FaCalendarPlus
} from 'react-icons/fa';
import { toast } from 'react-toastify';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = ({ onCampaignSelect, onCreateNewCheckup }) => {
  const { getHealthCampaigns, medicalCheckups, fetchMedicalCheckupById } = useHealthCheckup();

  const [stats, setStats] = useState({});
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [followupStudents, setFollowupStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const campaignsData = await getHealthCampaigns();

      // Lọc dữ liệu ngay trên client-side
      const completedCheckups = medicalCheckups.filter(c => c.checkupStatus === 'COMPLETED').length;
      const needsFollowUpCheckups = medicalCheckups.filter(c => c.checkupStatus === 'NEED_FOLLOW_UP');
      
      const calculatedStats = {
        totalCheckups: medicalCheckups.length,
        completed: completedCheckups,
        needsFollowUp: needsFollowUpCheckups.length,
        ongoingCampaigns: campaignsData.filter(c => c.status === 'ONGOING').length,
      };

      setStats(calculatedStats);
      setFollowupStudents(needsFollowUpCheckups);
      
      const sortedCampaigns = (campaignsData || [])
        .sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt))
        .slice(0, 5);
      setRecentCampaigns(sortedCampaigns);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [medicalCheckups]);

  const handleViewDetails = async (checkupId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    setSelectedCheckup(null);
    try {
        const data = await fetchMedicalCheckupById(checkupId);
        setSelectedCheckup(data);
    } catch (err) {
        console.error("Failed to fetch checkup details", err);
        toast.error("Không thể tải chi tiết lượt khám.");
        setShowDetailModal(false); // Close modal on error
    } finally {
        setDetailLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <h4 className="ms-3">Đang tải dữ liệu...</h4>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  const checkupStatusChartData = {
    labels: ['Đã hoàn thành', 'Cần theo dõi'],
    datasets: [{
      data: [stats.completed, stats.needsFollowUp],
      backgroundColor: ['#28a745', '#ffc107'],
      hoverBackgroundColor: ['#218838', '#e0a800']
    }],
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
      <div className="custom-progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
        <span className="progress-label">{completed}/{total}</span>
      </div>
    );
  };

  return (
    <div className="new-health-dashboard">
      <Row>
        {/* Left Column */}
        <Col lg={8}>
          <div className="dashboard-header">
            <h3>Tổng quan sức khỏe học đường</h3>
            <p>Phân tích và theo dõi các hoạt động khám sức khỏe.</p>
          </div>

          <Row>
            <Col md={12}>
              <Card className="dashboard-card chart-card">
                <Card.Body>
                  <Card.Title>Tỷ lệ trạng thái khám</Card.Title>
                   <div className="chart-container">
                    <Pie data={checkupStatusChartData} options={chartOptions} />
                   </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="dashboard-card">
            <Card.Header>
              <Card.Title>Các đợt khám gần đây</Card.Title>
              <Button variant="primary" size="sm" onClick={onCreateNewCheckup}>
                <FaCalendarPlus /> Tạo đợt khám mới
              </Button>
            </Card.Header>
            <Card.Body>
              <Table hover responsive className="campaign-table">
                <thead>
                  <tr>
                    <th>Tên đợt khám</th>
                    <th>Ngày bắt đầu</th>
                    <th>Trạng thái</th>
                    <th>Tiến độ</th>
                    <th></th>
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
                        <Button variant="link" size="sm" onClick={() => onCampaignSelect(c)}>
                          Chi tiết <FaArrowRight />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column */}
        <Col lg={4}>
          <Card className="dashboard-card stat-card blue">
            <Card.Body>
              <div className="stat-icon"><FaStethoscope /></div>
              <div className="stat-content">
                <p>Tổng số lượt khám</p>
                <h3>{stats.totalCheckups}</h3>
              </div>
            </Card.Body>
          </Card>
          <Card className="dashboard-card stat-card green">
            <Card.Body>
                <div className="stat-icon"><FaTasks /></div>
                <div className="stat-content">
                    <p>Chiến dịch đang diễn ra</p>
                    <h3>{stats.ongoingCampaigns}</h3>
                </div>
            </Card.Body>
          </Card>

           <Card className="dashboard-card">
            <Card.Header>
                <Card.Title><FaExclamationTriangle className="text-warning me-2" /> Học sinh cần theo dõi</Card.Title>
            </Card.Header>
            <Card.Body>
               <div className="followup-list">
                {followupStudents.length > 0 ? (
                  followupStudents.map(student => (
                    <div key={student.id} className="followup-item">
                      <div className="student-info">
                        <strong>{student.studentName}</strong>
                        <span> - Lớp {student.studentClass}</span>
                      </div>
                       <Button variant="outline-primary" size="sm" onClick={() => handleViewDetails(student.id)}>Xem</Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">Không có học sinh nào cần theo dõi.</p>
                )}
               </div>
            </Card.Body>
           </Card>
        </Col>
      </Row>
       <CheckupDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        details={selectedCheckup}
        loading={detailLoading}
      />
    </div>
  );
};

export default Dashboard;
