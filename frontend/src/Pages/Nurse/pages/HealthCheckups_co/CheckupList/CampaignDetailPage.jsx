import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Table, Spinner, Alert, Modal, Badge, ListGroup } from 'react-bootstrap';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaInfoCircle, 
  FaFileMedical, 
  FaListOl, 
  FaNotesMedical,
  FaTimesCircle,
  FaPlus,
  FaEdit
} from 'react-icons/fa';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { useAuth } from '../../../../../context/AuthContext';
import CreateCheckupFormModal from './CreateCheckupFormModal';
import Swal from 'sweetalert2';
import './CheckupList.css';

const CampaignDetailPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { getHealthCampaigns, getCampaignStudents, getConsentDetails, addHealthCheckup } = useHealthCheckup();
  const { currentUser } = useAuth();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [consentLoading, setConsentLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [campaign, setCampaign] = useState(null);
  const [campaignStudents, setCampaignStudents] = useState([]);
  const [selectedConsent, setSelectedConsent] = useState(null);

  // Modal states
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [studentForCheckup, setStudentForCheckup] = useState(null);

  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [responseFilter, setResponseFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Load campaign and students data
  useEffect(() => {
    const loadCampaignData = async () => {
      if (!campaignId) {
        setError('ID chiến dịch không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load campaigns to find the specific one
        const campaignsData = await getHealthCampaigns();
        const foundCampaign = campaignsData.find(c => c.id === parseInt(campaignId));
        
        if (!foundCampaign) {
          setError('Không tìm thấy chiến dịch');
          setLoading(false);
          return;
        }

        setCampaign(foundCampaign);

        // Load students for this campaign
        const studentsData = await getCampaignStudents(foundCampaign.id);
        setCampaignStudents(studentsData);
        
      } catch (err) {
        setError('Lỗi tải dữ liệu chiến dịch');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCampaignData();
  }, [campaignId, getHealthCampaigns, getCampaignStudents]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/nurse/health-checkups/campaign-list');
  };

  // Handle opening the consent details modal
  const handleViewConsent = async (consentId) => {
    if (!consentId) {
      Swal.fire({
        icon: 'info',
        title: 'Thông tin phản hồi',
        text: 'Phụ huynh chưa phản hồi cho chiến dịch này.',
      });
      return;
    }
    setSelectedConsent(null);
    setShowConsentModal(true);
    setConsentLoading(true);
    try {
      const consentData = await getConsentDetails(consentId);
      setSelectedConsent(consentData);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải chi tiết đồng ý',
        text: 'Không thể tải chi tiết đồng ý của phụ huynh.',
      });
      console.error(err);
    } finally {
      setConsentLoading(false);
    }
  };

  // Handle opening create checkup modal
  const handleCreateCheckup = (student) => {
    setStudentForCheckup(student);
    setShowCreateModal(true);
  };

  // Handle successful checkup creation
  const handleCheckupCreated = async (formData) => {
    try {
      // Call the API to create checkup
      await addHealthCheckup(formData);

      setShowCreateModal(false);
      setStudentForCheckup(null);

      // Reload students data to reflect changes
      try {
        const studentsData = await getCampaignStudents(campaign.id);
        setCampaignStudents(studentsData);
      } catch (err) {
        console.error('Error reloading students:', err);
      }

      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Hồ sơ khám sức khỏe đã được tạo thành công.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating checkup:', error);
      throw error; // Re-throw để modal không đóng khi có lỗi
    }
  };

  // Get consent status display
  const getConsentStatus = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge bg="success">Đã đồng ý</Badge>;
      case 'REJECTED':
        return <Badge bg="danger">Từ chối</Badge>;
      case 'PENDING':
        return <Badge bg="warning">Chờ phản hồi</Badge>;
      default:
        return <Badge bg="secondary">Chưa phản hồi</Badge>;
    }
  };

  // Render consent status badge in modal
  const renderConsentStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge bg="success" className="status-badge">Đã đồng ý</Badge>;
      case 'REJECTED':
        return <Badge bg="danger" className="status-badge">Từ chối</Badge>;
      case 'PENDING':
        return <Badge bg="warning" className="status-badge">Chờ phản hồi</Badge>;
      default:
        return <Badge bg="secondary" className="status-badge">Chưa phản hồi</Badge>;
    }
  };

  // Render checkup actions
  const renderCheckupActions = (student) => {
    if (student.hasCheckupRecord) {
      return (
        <Button variant="outline-success" size="sm" disabled>
          <FaEdit className="me-1" />
          Đã khám
        </Button>
      );
    } else if (student.consentStatus === 'APPROVED') {
      return (
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={() => handleCreateCheckup(student)}
        >
          <FaPlus className="me-1" />
          Tạo hồ sơ khám
        </Button>
      );
    } else {
      return (
        <Button variant="outline-secondary" size="sm" disabled>
          <FaTimesCircle className="me-1" />
          Chưa đồng ý
        </Button>
      );
    }
  };

  // Filter students based on search criteria
  const filteredStudents = campaignStudents.filter(student => {
    const matchesName = student.studentName.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesClass = student.studentClass.toLowerCase().includes(classFilter.toLowerCase());
    const matchesResponse = responseFilter === '' || student.consentStatus === responseFilter;
    
    return matchesName && matchesClass && matchesResponse;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Handle page change with smooth scroll
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-between align-items-center mt-4 px-3">
        {/* Showing entries info */}
        <div className="text-muted">
          <small>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
          </small>
        </div>

        {/* Pagination controls */}
        <div className="d-flex align-items-center gap-2">
          {/* First page button */}
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
            title="Trang đầu"
            style={{ minWidth: '40px' }}
          >
            <i className="fas fa-angle-double-left"></i>
          </button>

          {/* Previous page button */}
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            title="Trang trước"
            style={{ minWidth: '40px' }}
          >
            <i className="fas fa-angle-left"></i>
          </button>

          {/* Current page indicator */}
          <div
            className="px-3 py-1 text-white rounded"
            style={{
              minWidth: '60px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'
            }}
          >
            {currentPage} / {totalPages}
          </div>

          {/* Next page button */}
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            title="Trang tiếp"
            style={{ minWidth: '40px' }}
          >
            <i className="fas fa-angle-right"></i>
          </button>

          {/* Last page button */}
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            title="Trang cuối"
            style={{ minWidth: '40px' }}
          >
            <i className="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Đang tải dữ liệu chiến dịch...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h5>Lỗi</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={handleBack}>
            <FaArrowLeft className="me-2" />
            Quay lại danh sách
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h5>Không tìm thấy chiến dịch</h5>
          <p>Chiến dịch với ID {campaignId} không tồn tại.</p>
          <Button variant="outline-warning" onClick={handleBack}>
            <FaArrowLeft className="me-2" />
            Quay lại danh sách
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="campaign-detail-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={handleBack} className="mb-2">
            <FaArrowLeft className="me-2" />
            Quay lại danh sách
          </Button>
          <h2 className="mb-0">
            <FaCalendarAlt className="me-2" />
            Chi tiết chiến dịch: {campaign.title}
          </h2>
        </div>
      </div>

      {/* Campaign Info Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Thông tin chiến dịch</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Tên chiến dịch:</strong> {campaign.title}</p>
              <p><strong>Mô tả:</strong> {campaign.description}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Ngày bắt đầu:</strong> {new Date(campaign.startDate).toLocaleDateString('vi-VN')}</p>
              <p><strong>Ngày kết thúc:</strong> {new Date(campaign.endDate).toLocaleDateString('vi-VN')}</p>
              <p><strong>Trạng thái:</strong> {campaign.status}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Students List */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Danh sách học sinh ({filteredStudents.length} học sinh)</h5>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo tên học sinh..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo lớp..."
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={responseFilter}
                onChange={(e) => setResponseFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="APPROVED">Đã đồng ý</option>
                <option value="REJECTED">Từ chối</option>
                <option value="PENDING">Chờ phản hồi</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên học sinh</th>
                <th>Lớp</th>
                <th>Tên phụ huynh</th>
                <th>Trạng thái phản hồi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, index) => (
                <tr key={student.studentId}>
                  <td>{startIndex + index + 1}</td>
                  <td>{student.studentName}</td>
                  <td>{student.studentClass}</td>
                  <td>{student.parentName}</td>
                  <td>{getConsentStatus(student.consentStatus)}</td>
                  <td>
                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleViewConsent(student.parentConsentId)}>
                      <FaInfoCircle /> Xem
                    </Button>
                    {renderCheckupActions(student)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">Không có học sinh nào phù hợp với bộ lọc.</p>
            </div>
          )}

          {renderPagination()}
        </Card.Body>
      </Card>

      {/* Consent Details Modal */}
      <Modal 
        show={showConsentModal} 
        onHide={() => setShowConsentModal(false)} 
        dialogClassName="feedback-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFileMedical className="modal-title-icon" />
            Chi tiết Phản hồi của Phụ huynh
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {consentLoading ? (
            <div className="loading-container">
              <Spinner animation="border" />
              <p>Đang tải chi tiết phản hồi...</p>
            </div>
          ) : !selectedConsent ? (
            <Alert variant="warning">Không tìm thấy thông tin.</Alert>
          ) : (
            <>
              <div className="feedback-header-section">
                <div className="feedback-status-container">
                  <span className="feedback-status-label">Trạng thái phản hồi :  </span>
                  {renderConsentStatusBadge(selectedConsent.consentStatus)}
                </div>
              </div>

              <div className="feedback-info-section">
                <h5 className="feedback-details-title">
                  <FaListOl className="feedback-details-icon" />
                  Các mục khám đặc biệt đã chọn
                </h5>
                {selectedConsent.selectedSpecialCheckupItems?.length > 0 ? (
                  <ListGroup variant="flush">
                    {selectedConsent.selectedSpecialCheckupItems.map((item, index) => (
                      <ListGroup.Item key={index}>{item}</ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted">Không có mục khám đặc biệt nào được chọn.</p>
                )}
              </div>

              <div className="feedback-info-section">
                <h5 className="feedback-details-title">
                  <FaNotesMedical className="feedback-details-icon" />
                  Ghi chú của phụ huynh
                </h5>
                <p className="text-muted">{selectedConsent.consent?.parentNotes || 'Không có ghi chú.'}</p>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Create Checkup Modal */}
      <CreateCheckupFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        student={studentForCheckup}
        campaign={campaign}
        onSubmit={handleCheckupCreated}
      />
    </Container>
  );
};

export default CampaignDetailPage;
