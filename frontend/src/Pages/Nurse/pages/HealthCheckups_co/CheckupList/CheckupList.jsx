import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Table, Badge, Row, Col, Alert, Spinner, ProgressBar, Form, ListGroup } from 'react-bootstrap';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { useAuth } from '../../../../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt, FaUsers, FaChild, FaCheckCircle, FaTimesCircle, FaClock, FaStethoscope,
  FaFileMedical, FaEye, FaInfoCircle, FaSearch, FaNotesMedical, FaListOl,
} from 'react-icons/fa';
import CreateCheckupFormModal from './CreateCheckupFormModal';
import './CheckupList.css'; // Sẽ tạo style mới cho component này

const CheckupList = () => {
  const { getHealthCampaigns, getCampaignStudents, getConsentDetails, addHealthCheckup } = useHealthCheckup();
  const { currentUser } = useAuth();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStudents, setCampaignStudents] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedConsent, setSelectedConsent] = useState(null);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [studentForCheckup, setStudentForCheckup] = useState(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch campaigns on component mount
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getHealthCampaigns();
        // Lọc bỏ những chiến dịch đã hủy
        const activeCampaigns = data.filter(c => c.status !== 'CANCELLED');
        setCampaigns(activeCampaigns);
    } catch (err) {
        setError('Không thể tải danh sách chiến dịch. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [getHealthCampaigns]);

  // Handle opening the campaign details modal
  const handleViewDetails = async (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
    setDetailsLoading(true);
    try {
      const studentsData = await getCampaignStudents(campaign.id);
      setCampaignStudents(studentsData);
    } catch (err) {
      toast.error(`Lỗi tải danh sách học sinh cho chiến dịch: ${campaign.title}`);
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle opening the consent details modal
  const handleViewConsent = async (consentId) => {
    if (!consentId) {
      toast.info('Phụ huynh chưa đưa ra quyết định.');
      return;
    }
    setSelectedConsent(null);
    setShowConsentModal(true);
    setConsentLoading(true);
    try {
      const consentData = await getConsentDetails(consentId);
      setSelectedConsent(consentData);
    } catch (err) {
      toast.error('Không thể tải chi tiết đồng ý của phụ huynh.');
      console.error(err);
    } finally {
      setConsentLoading(false);
    }
  };

  // Handle opening the create health profile modal
  const handleCreateHealthProfile = (student) => {
    setStudentForCheckup(student);
    setShowCreateModal(true);
  };

  // Handle form submission from the modal
  const handleCreateCheckupSubmit = async (formData) => {
    try {
      await addHealthCheckup(formData);
      toast.success(`Đã tạo hồ sơ khám cho học sinh ${studentForCheckup.studentName} thành công!`);
    } catch (error) {
      console.error("Lỗi khi tạo hồ sơ khám:", error);
      const errorMessage = error?.response?.data || error?.message || 'Tạo hồ sơ khám thất bại do lỗi không xác định.';
      toast.error(errorMessage);
      throw error; // Re-throw to keep modal open on error
    }
  };
  
  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };
  
  // Helper to render status badge
  const renderCampaignStatus = (status) => {
    switch (status) {
      case 'PREPARING':
        return <Badge bg="info"><FaClock /> Sắp diễn ra</Badge>;
      case 'ONGOING':
        return <Badge bg="success"><FaStethoscope /> Đang diễn ra</Badge>;
      case 'COMPLETED':
        return <Badge bg="secondary"><FaCheckCircle /> Đã hoàn thành</Badge>;
      default:
        return <Badge bg="light text-dark">{status}</Badge>;
    }
  };
  
  const getConsentStatus = (status) => {
    switch (status) {
      case 'APPROVED':
      return <Badge bg="success">Đã đồng ý</Badge>;
      case 'REJECTED':
      return <Badge bg="danger">Đã từ chối</Badge>;
      case 'PENDING':
      return <Badge bg="warning">Chờ phản hồi</Badge>;
      default:
        return <Badge bg="secondary">Chưa có</Badge>;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.totalStudents > 0 &&
    (campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Đang tải dữ liệu chiến dịch...</p>
      </div>
    );
  }

  return (
    <div className="checkup-list-container-new">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="page-header">
        <h2><FaCalendarAlt className="mr-2" /> Quản lý Chiến dịch Khám sức khỏe</h2>
          <div className="search-container">
              <FaSearch className="search-icon" />
              <Form.Control
                type="text"
            placeholder="Tìm kiếm chiến dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
        </div>
      </div>
      
      <Row xs={1} md={2} className="g-4">
        {filteredCampaigns.map((campaign) => (
          <Col key={campaign.id}>
            <Card className="campaign-card-new">
              <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                <span><FaNotesMedical /> {campaign.title}</span>
                <div>
                  <Badge pill bg="primary" className="me-2">
                    ID: {campaign.id}
                  </Badge>
                {renderCampaignStatus(campaign.status)}
                </div>
              </Card.Header>
              <Card.Body>
                <Card.Text>{campaign.description}</Card.Text>
                <div className="campaign-stats">
                  <div className="stat-item">
                    <FaUsers size={20} />
                    <div>
                      <span>Tổng số</span>
                      <strong>{campaign.totalStudents}</strong>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FaCheckCircle size={20} className="text-success"/>
                    <div>
                      <span>Đồng ý</span>
                      <strong>{campaign.consentedStudents}</strong>
                    </div>
                  </div>
                   <div className="stat-item">
                    <FaFileMedical size={20} className="text-primary"/>
                    <div>
                      <span>Đã khám</span>
                      <strong>{campaign.completedCheckups}</strong>
                </div>
                  </div>
                  <div className="stat-item">
                    <FaClock size={20} className="text-warning"/>
                    <div>
                      <span>Chờ khám</span>
                      <strong>{campaign.pendingCheckups}</strong>
                    </div>
                  </div>
                </div>
                <ProgressBar className="mt-3 progress-container-custom">
                  <ProgressBar
                    variant="success"
                    now={campaign.totalStudents > 0 ? (campaign.consentedStudents / campaign.totalStudents) * 100 : 0}
                    key={1}
                    label={`Đồng ý: ${campaign.consentedStudents}`}
                  />
                  <ProgressBar
                    variant="primary"
                    now={campaign.totalStudents > 0 ? (campaign.completedCheckups / campaign.totalStudents) * 100 : 0}
                    key={2}
                    label={`Đã khám: ${campaign.completedCheckups}`}
                  />
                </ProgressBar>
              </Card.Body>
              <Card.Footer className="text-muted d-flex justify-content-between align-items-center">
                <span>Bắt đầu: {formatDate(campaign.startDate)}</span>
                <Button variant="primary" onClick={() => handleViewDetails(campaign)}>
                  <FaEye /> Xem chi tiết
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Campaign Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết chiến dịch: {selectedCampaign?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsLoading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                  <th>STT</th>
                  <th>Tên học sinh</th>
                  <th>Lớp</th>
                  <th>Tên phụ huynh</th>
                  <th>Phản hồi</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                {campaignStudents.map((student, index) => (
                  <tr key={student.studentId}>
                    <td>{index + 1}</td>
                    <td>{student.studentName}</td>
                    <td>{student.studentClass}</td>
                    <td>{student.parentName}</td>
                    <td>{getConsentStatus(student.consentStatus)}</td>
                    <td>
                      <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleViewConsent(student.parentConsentId)}>
                        <FaInfoCircle /> Xem
                      </Button>
                      {student.consentStatus === 'APPROVED' && (
                        <Button variant="outline-success" size="sm" onClick={() => handleCreateHealthProfile(student)}>
                          <FaStethoscope /> Tạo HS
                              </Button>
                            )}
                          </td>
                        </tr>
                ))}
                  </tbody>
                </Table>
          )}
        </Modal.Body>
      </Modal>

      {/* Consent Details Modal */}
      <Modal show={showConsentModal} onHide={() => setShowConsentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết Phản hồi của Phụ huynh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {consentLoading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : !selectedConsent ? (
            <Alert variant="warning">Không tìm thấy thông tin.</Alert>
          ) : (
            <div>
            <Row>
              <Col md={6}>
                        <p><strong>Học sinh:</strong> {selectedConsent.studentName}</p>
              </Col>
              <Col md={6}>
                        <p><strong>Trạng thái:</strong> {getConsentStatus(selectedConsent.consentStatus)}</p>
              </Col>
            </Row>
                 <p><strong>Chiến dịch:</strong> {selectedConsent.campaignTitle}</p>
                 <hr/>
                 <h5><FaListOl/> Các mục khám đặc biệt đã chọn:</h5>
                 {selectedConsent.selectedSpecialCheckupItems?.length > 0 ? (
                    <ListGroup variant="flush">
                        {selectedConsent.selectedSpecialCheckupItems.map((item, index) => (
                            <ListGroup.Item key={index}>{item}</ListGroup.Item>
                        ))}
                    </ListGroup>
                 ) : (
                    <p className="text-muted">Không có mục khám đặc biệt nào được chọn.</p>
                 )}
                 <h5 className="mt-3"><FaNotesMedical/> Ghi chú của phụ huynh:</h5>
                 <p className="text-muted">{selectedConsent.consent?.parentNotes || 'Không có ghi chú.'}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConsentModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Checkup Form Modal */}
      {studentForCheckup && (
        <CreateCheckupFormModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            student={studentForCheckup}
            campaign={selectedCampaign}
            onSubmit={handleCreateCheckupSubmit}
        />
      )}
    </div>
  );
};

export default CheckupList;
