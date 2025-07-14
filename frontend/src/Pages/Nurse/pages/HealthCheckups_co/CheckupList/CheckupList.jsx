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
import './CheckupList.css';

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
  
  // Details view states
  const [showDetailsSection, setShowDetailsSection] = useState(false);
  const [detailsRef, setDetailsRef] = useState(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState('');
  
  // Filter states for student details
  const [nameFilter, setNameFilter] = useState('');
  const [responseFilter, setResponseFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 2 hàng x 3 thẻ

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

  // Handle opening the campaign details section
  const handleViewDetails = async (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsSection(true);
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

    // Auto-scroll to details section after a short delay
    setTimeout(() => {
      if (detailsRef) {
        detailsRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle closing the details section
  const handleCloseDetails = () => {
    setShowDetailsSection(false);
    setSelectedCampaign(null);
    setCampaignStudents([]);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setNameFilter('');
    setClassFilter('');
    setResponseFilter('');
  };

  // Handle reset main filters
  const handleResetMainFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
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
      
      // Refresh campaign students data to show updated status
      if (selectedCampaign) {
        try {
          const studentsData = await getCampaignStudents(selectedCampaign.id);
          setCampaignStudents(studentsData);
        } catch (refreshError) {
          console.error("Error refreshing students data:", refreshError);
        }
      }
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
        return <Badge bg="info" className="status-badge">Đang chuẩn bị</Badge>;
      case 'ONGOING':
        return <Badge bg="success" className="status-badge">Đang tiến hành</Badge>;
      case 'COMPLETED':
        return <Badge bg="secondary" className="status-badge">Đã hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge bg="danger" className="status-badge">Đã hủy</Badge>;
      default:
        return <Badge bg="light" className="status-badge">{status}</Badge>;
    }
  };
  
  // Helper to get campaign card class based on status
  const getCampaignCardClass = (status) => {
    switch (status) {
      case 'PREPARING':
        return 'campaign-card campaign-card-preparing h-100';
      case 'ONGOING':
        return 'campaign-card campaign-card-ongoing h-100';
      case 'COMPLETED':
        return 'campaign-card campaign-card-completed h-100';
      case 'CANCELLED':
        return 'campaign-card campaign-card-cancelled h-100';
      default:
        return 'campaign-card h-100';
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

  // Helper to render checkup status and actions
  const renderCheckupActions = (student) => {
    const { consentStatus, checkupStatus } = student;
    
    if (consentStatus !== 'APPROVED') {
      return null;
    }
    
    // Logic theo yêu cầu
    if (checkupStatus === null || checkupStatus === undefined) {
      // Chưa có checkup - hiển thị nút tạo hồ sơ
      return (
        <Button variant="outline-success" size="sm" onClick={() => handleCreateHealthProfile(student)}>
          <FaStethoscope /> Tạo HS
        </Button>
      );
    } else if (checkupStatus === 'NEED_FOLLOW_UP') {
      // Đã tạo HS và cần theo dõi
      return (
        <Badge bg="warning" className="checkup-status-badge">
          <FaStethoscope className="me-1" />
          Đã tạo HS (cần theo dõi thêm)
        </Badge>
      );
    } else if (checkupStatus === 'COMPLETED') {
      // Đã tạo HS và hoàn thành
      return (
        <Badge bg="success" className="checkup-status-badge">
          <FaCheckCircle className="me-1" />
          Đã tạo HS (Hoàn thành)
        </Badge>
      );
    }
    
    return null;
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.totalStudents > 0 &&
    (campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || campaign.status === statusFilter)
  ).sort((a, b) => {
    // Sắp xếp theo ngày khám từ mới nhất về trước
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB - dateA; // Ngày mới nhất trước
  });

  // Filter students based on search criteria
  const filteredStudents = campaignStudents.filter(student => {
    const matchesName = student.studentName.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesClass = student.studentClass.toLowerCase().includes(classFilter.toLowerCase());
    const matchesResponse = responseFilter === '' || 
      (responseFilter === 'APPROVED' && student.consentStatus === 'APPROVED') ||
      (responseFilter === 'REJECTED' && student.consentStatus === 'REJECTED') ||
      (responseFilter === 'PENDING' && student.consentStatus === 'PENDING');
    
    return matchesName && matchesClass && matchesResponse;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredCampaigns.length)} trong {filteredCampaigns.length} chiến dịch
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ← Trước
          </button>
          {pages}
          <button
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Tiếp →
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Đang tải danh sách chiến dịch khám sức khỏe...</p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .lukhang-checkuplist-wrapper {
            background: #f8f9fa !important;
            min-height: 100vh !important;
          }
          
          .lukhang-checkuplist-header-section {
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%) !important;
            border: 1px solid #e9ecef !important;
            border-radius: 12px !important;
            padding: 2rem !important;
            margin-bottom: 2rem !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
          }
          
          .lukhang-checkuplist-title-section {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 1.5rem !important;
          }
          
          .lukhang-checkuplist-main-title {
            color: #495057 !important;
            font-weight: 700 !important;
            font-size: 1.75rem !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            text-shadow: none !important;
          }
          
          .lukhang-checkuplist-main-title i {
            color: #dc3545 !important;
            margin-right: 0.75rem !important;
            font-size: 1.5rem !important;
          }
          
          .lukhang-checkuplist-reset-button {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
            border: 2px solid #007bff !important;
            color: white !important;
            font-weight: 600 !important;
            padding: 0.5rem 1.5rem !important;
            border-radius: 25px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2) !important;
            font-size: 0.9rem !important;
          }
          
          .lukhang-checkuplist-reset-button:hover {
            background: linear-gradient(135deg, #0056b3 0%, #004085 100%) !important;
            border-color: #0056b3 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3) !important;
            color: white !important;
          }
          
          .lukhang-checkuplist-reset-button:focus {
            box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.25) !important;
            color: white !important;
          }
          
          .lukhang-checkuplist-filters-row {
            display: flex !important;
            gap: 1rem !important;
            align-items: end !important;
            flex-wrap: wrap !important;
          }
          
          .lukhang-checkuplist-status-filter {
            background: white !important;
            border: 2px solid #e9ecef !important;
            border-radius: 8px !important;
            padding: 0.25rem !important;
            min-width: 200px !important;
            transition: all 0.3s ease !important;
          }
          
          .lukhang-checkuplist-status-filter:focus-within {
            border-color: #007bff !important;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1) !important;
          }
          
          .lukhang-checkuplist-status-select {
            border: none !important;
            outline: none !important;
            background: transparent !important;
            color: #495057 !important;
            font-weight: 500 !important;
          }
          
          .lukhang-checkuplist-search-container {
            flex: 1 !important;
            min-width: 250px !important;
          }
          
          .lukhang-checkuplist-search-input {
            border: 2px solid #e9ecef !important;
            border-radius: 8px !important;
            padding: 0.75rem 1rem !important;
            font-size: 1rem !important;
            transition: all 0.3s ease !important;
            background: white !important;
          }
          
          .lukhang-checkuplist-search-input:focus {
            border-color: #007bff !important;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1) !important;
            outline: none !important;
          }
          
          .campaign-card .card-header h5 {
            color: white !important;
          }
    
          .campaign-card .card-header .id-badge {
            background-color: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
          }
          
          @media (max-width: 768px) {
            .lukhang-checkuplist-header-section {
              padding: 1.5rem !important;
            }
            
            .lukhang-checkuplist-title-section {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 1rem !important;
            }
            
            .lukhang-checkuplist-main-title {
              font-size: 1.5rem !important;
            }
            
            .lukhang-checkuplist-filters-row {
              flex-direction: column !important;
              gap: 1rem !important;
            }
            
            .lukhang-checkuplist-status-filter,
            .lukhang-checkuplist-search-container {
              min-width: 100% !important;
            }
          }
        `}
      </style>
      <div className="checkup-list-container lukhang-checkuplist-wrapper">
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="page-header lukhang-checkuplist-header-section">
          <div className="header-title-section lukhang-checkuplist-title-section">
            <h2 className="lukhang-checkuplist-main-title">
              <FaCalendarAlt /> 
              Quản lý Chiến dịch Khám sức khỏe
            </h2>
            <div className="header-reset-action">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleResetMainFilters}
                className="lukhang-checkuplist-reset-button"
              >
                Đặt lại
              </Button>
            </div>
          </div>
          <div className="header-filters">
            <div className="filter-row lukhang-checkuplist-filters-row">
              <div className="status-filter lukhang-checkuplist-status-filter">
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-filter-select lukhang-checkuplist-status-select"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PREPARING">Đang chuẩn bị</option>
                  <option value="ONGOING">Đang tiến hành</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </Form.Select>
              </div>
              <div className="search-container lukhang-checkuplist-search-container">
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm chiến dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input lukhang-checkuplist-search-input"
                />
              </div>
            </div>
          </div>
        </div>
      
      <div className="campaign-grid">
        {currentCampaigns.map((campaign) => (
          <Card key={campaign.id} className={getCampaignCardClass(campaign.status)}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{campaign.title}</h5>
              <Badge className="id-badge">
                ID: {campaign.id}
              </Badge>
            </Card.Header>
            <Card.Body>
              {/* Container cho phần mô tả và ghi chú */}
              <div className="campaign-content-top">
                <p className="campaign-description">{campaign.description}</p>

                {campaign.notes && (
                  <div className="campaign-notes mb-3">
                    <small className="text-muted">
                      <FaInfoCircle className="me-1" />
                      {campaign.notes}
                    </small>
                  </div>
                )}
              </div>

              {/* Container cho các phần stats - cố định ở dưới */}
              <div className="campaign-stats-container">
                {/* Phần thống kê số liệu */}
                <div className="campaign-stats-numbers">
                  <div className="stat-box">
                    <span className="stat-number">{campaign.totalStudents}</span>
                    <div className="stat-label">Tổng số HS</div>
                  </div>
                  <div className="stat-box success">
                    <span className="stat-number">{campaign.consentedStudents}</span>
                    <div className="stat-label">Đã đồng ý</div>
                  </div>
                  <div className="stat-box info">
                    <span className="stat-number">{campaign.completedCheckups}</span>
                    <div className="stat-label">Đã khám</div>
                  </div>
                  <div className="stat-box follow-up">
                    <span className="stat-number">{campaign.followUpCheckups || 0}</span>
                    <div className="stat-label">Theo dõi</div>
                  </div>
                </div>

                {/* Phần thông tin thời gian */}
                <div className="campaign-stats-dates">
                  <div className="stat-box date">
                    <span className="stat-number">{formatDate(campaign.startDate)}</span>
                    <div className="stat-label">Ngày khám</div>
                  </div>
                  <div className="stat-box deadline">
                    <span className="stat-number">{formatDate(campaign.endDate)}</span>
                    <div className="stat-label">Hạn chót ĐK</div>
                  </div>
                </div>

                <div className="campaign-bottom">
                  <div className="campaign-status-info">
                    <FaNotesMedical className="status-icon" />
                    <span className="status-label">Trạng thái:</span>
                    <span className="status-value">{renderCampaignStatus(campaign.status)}</span>
                  </div>

                  <Button 
                    className="action-button"
                    onClick={() => handleViewDetails(campaign)}
                  >
                    <FaEye className="me-2" />
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
      
      {renderPagination()}
      
      {/* Campaign Details Section */}
      {showDetailsSection && selectedCampaign && (
        <div 
          className="campaign-details-section"
          ref={(el) => setDetailsRef(el)}
        >
          <div className="details-header">
            <h3>
              <FaCalendarAlt className="me-2" />
              Chi tiết chiến dịch: {selectedCampaign.title}
            </h3>
            <Button variant="outline-secondary" onClick={handleCloseDetails}>
              <FaTimesCircle className="me-2" />
              Đóng
            </Button>
          </div>
          
          <div className="details-content">
            {detailsLoading ? (
              <div className="loading-container">
                <Spinner animation="border" />
                <p>Đang tải danh sách học sinh...</p>
              </div>
            ) : (
              <div className="students-table-container">
                {/* Student Filter Section */}
                <div className="student-filters mb-3">
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Tìm theo tên học sinh:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập tên học sinh..."
                          value={nameFilter}
                          onChange={(e) => setNameFilter(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Tìm theo lớp:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập lớp..."
                          value={classFilter}
                          onChange={(e) => setClassFilter(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Tìm theo phản hồi:</Form.Label>
                        <Form.Select
                          value={responseFilter}
                          onChange={(e) => setResponseFilter(e.target.value)}
                        >
                          <option value="">Tất cả</option>
                          <option value="APPROVED">Đã đồng ý</option>
                          <option value="REJECTED">Đã từ chối</option>
                          <option value="PENDING">Chờ phản hồi</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={12} className="text-end">
                      <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
                        Đặt lại bộ lọc
                      </Button>
                    </Col>
                  </Row>
                </div>

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
                    {filteredStudents.map((student, index) => (
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
                          {renderCheckupActions(student)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Campaign Details Modal - Keep for other uses */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết chiến dịch: {selectedCampaign?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsLoading ? (
            <div className="loading-container">
              <Spinner animation="border" />
              <p>Đang tải danh sách học sinh...</p>
            </div>
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
                      {renderCheckupActions(student)}
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
          <Modal.Title style={{color:'red'}}>Chi tiết Phản hồi của Phụ huynh</Modal.Title>
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
              <h5><FaListOl className="me-2"/>Các mục khám đặc biệt đã chọn:</h5>
              {selectedConsent.selectedSpecialCheckupItems?.length > 0 ? (
                <ListGroup variant="flush">
                  {selectedConsent.selectedSpecialCheckupItems.map((item, index) => (
                    <ListGroup.Item key={index}>{item}</ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">Không có mục khám đặc biệt nào được chọn.</p>
              )}
              <h5 className="mt-3"><FaNotesMedical className="me-2"/>Ghi chú của phụ huynh:</h5>
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
    </>
  );
};

export default CheckupList;
