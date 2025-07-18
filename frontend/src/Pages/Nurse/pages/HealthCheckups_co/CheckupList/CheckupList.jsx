import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Table, Badge, Alert, Spinner, ProgressBar, Form, ListGroup } from 'react-bootstrap';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { useAuth } from '../../../../../context/AuthContext';
import Swal from 'sweetalert2';
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
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải danh sách học sinh',
        text: `Lỗi tải danh sách học sinh cho chiến dịch: ${campaign.title}`,
      });
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

  // Check if any student filters are active
  const hasActiveStudentFilters = () => {
    return nameFilter.trim() !== "" || classFilter.trim() !== "" || responseFilter !== "";
  };

  // Handle reset main filters
  const handleResetMainFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  // Check if any main filters are active
  const hasActiveMainFilters = () => {
    return searchTerm.trim() !== "" || statusFilter !== "";
  };

  // Handle opening the consent details modal
  const handleViewConsent = async (consentId) => {
    if (!consentId) {
      Swal.fire({
        icon: 'info',
        title: 'Thông tin phản hồi',
        text: 'Phụ huynh chưa đưa ra quyết định.',
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

  // Handle opening the create health profile modal
  const handleCreateHealthProfile = (student) => {
    setStudentForCheckup(student);
    setShowCreateModal(true);
  };

  // Handle form submission from the modal
  const handleCreateCheckupSubmit = async (formData) => {
    try {
      await addHealthCheckup(formData);
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: `Đã tạo hồ sơ khám cho học sinh ${studentForCheckup.studentName} thành công!`,
        timer: 2000,
        showConfirmButton: false
      });
      
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
      Swal.fire({
        icon: 'error',
        title: 'Tạo hồ sơ thất bại',
        text: errorMessage,
      });
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

  const renderConsentStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <div className="feedback-status-badge approved">
            <FaCheckCircle className="feedback-status-badge-icon" />
            Đã đồng ý
          </div>
        );
      case 'REJECTED':
        return (
          <div className="feedback-status-badge rejected">
            <FaTimesCircle className="feedback-status-badge-icon" />
            Đã từ chối
          </div>
        );
      case 'PENDING':
      default:
        return (
          <div className="feedback-status-badge pending">
            <FaClock className="feedback-status-badge-icon" />
            Chờ phản hồi
          </div>
        );
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

    return (
      <div className="d-flex justify-content-between align-items-center mt-4 px-3">
        {/* Showing entries info */}
        <div className="text-muted">
          <small>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
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
      <div className="checkup-list-container lukhang-checkuplist-wrapper">
        {error && <Alert variant="danger">{error}</Alert>}
        
        {/* Enhanced Filter Section - Styled like StudentList */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'}}>
                <h5 className="mb-0" style={{color: 'white'}}>
                  <i className="fas fa-filter me-2"></i>
                  Bộ lọc Chiến dịch Khám sức khỏe
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  {/* Status Filter */}
                  <div className="col-md-4">
                    <label htmlFor="statusFilter" className="form-label fw-bold">
                      <i className="fas fa-tasks me-1"></i>
                      Trạng thái
                    </label>
                    <Form.Select
                      id="statusFilter"
                      className="form-select form-select-lg"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="PREPARING">Đang chuẩn bị</option>
                      <option value="ONGOING">Đang tiến hành</option>
                      <option value="COMPLETED">Đã hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </Form.Select>
                  </div>

                  {/* Search Filter */}
                  <div className={hasActiveMainFilters() ? "col-md-6" : "col-md-8"}>
                    <label htmlFor="searchTerm" className="form-label fw-bold">
                      <i className="fas fa-search me-1"></i>
                      Tìm kiếm chiến dịch
                    </label>
                    <Form.Control
                      id="searchTerm"
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Tìm kiếm theo tên hoặc mô tả chiến dịch..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Reset Button - Only show when filters are active */}
                  {hasActiveMainFilters() && (
                    <div className="col-md-2">
                      <Button
                        variant="outline-secondary"
                        className="btn btn-outline-secondary btn-lg w-100"
                        onClick={handleResetMainFilters}
                        title="Xóa bộ lọc"
                      >
                        <i className="fas fa-redo me-2"></i>
                        Đặt lại
                      </Button>
                    </div>
                  )}
                </div>

                {/* Filter Summary */}
                {hasActiveMainFilters() && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="alert alert-info mb-0">
                        <i className="fas fa-info-circle me-2"></i>
                        Tìm thấy <strong>{filteredCampaigns.length}</strong> chiến dịch
                        {searchTerm.trim() !== "" && (
                          <span> có tên/mô tả chứa "<strong>{searchTerm}</strong>"</span>
                        )}
                        {statusFilter !== "" && (
                          <span> với trạng thái <strong>
                            {statusFilter === 'PREPARING' && 'Đang chuẩn bị'}
                            {statusFilter === 'ONGOING' && 'Đang tiến hành'}
                            {statusFilter === 'COMPLETED' && 'Đã hoàn thành'}
                            {statusFilter === 'CANCELLED' && 'Đã hủy'}
                          </strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                {/* Enhanced Student Filter Section */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header" style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'}}>
                    <h6 className="mb-0 text-white">
                      <i className="fas fa-filter me-2"></i>
                      Lọc danh sách học sinh
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3 align-items-end">
                      {/* Name Filter */}
                      <div className="col-md-4">
                        <label htmlFor="nameFilter" className="form-label fw-bold">
                          <i className="fas fa-user me-1"></i>
                          Tên học sinh
                        </label>
                        <Form.Control
                          id="nameFilter"
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="Nhập tên học sinh..."
                          value={nameFilter}
                          onChange={(e) => setNameFilter(e.target.value)}
                        />
                      </div>

                      {/* Class Filter */}
                      <div className="col-md-3">
                        <label htmlFor="classFilter" className="form-label fw-bold">
                          <i className="fas fa-users me-1"></i>
                          Lớp
                        </label>
                        <Form.Control
                          id="classFilter"
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="Nhập lớp..."
                          value={classFilter}
                          onChange={(e) => setClassFilter(e.target.value)}
                        />
                      </div>

                      {/* Response Filter */}
                      <div className={hasActiveStudentFilters() ? "col-md-3" : "col-md-5"}>
                        <label htmlFor="responseFilter" className="form-label fw-bold">
                          <i className="fas fa-comment-dots me-1"></i>
                          Phản hồi
                        </label>
                        <Form.Select
                          id="responseFilter"
                          className="form-select form-select-lg"
                          value={responseFilter}
                          onChange={(e) => setResponseFilter(e.target.value)}
                        >
                          <option value="">Tất cả</option>
                          <option value="APPROVED">Đã đồng ý</option>
                          <option value="REJECTED">Đã từ chối</option>
                          <option value="PENDING">Chờ phản hồi</option>
                        </Form.Select>
                      </div>

                      {/* Reset Button - Only show when filters are active */}
                      {hasActiveStudentFilters() && (
                        <div className="col-md-2">
                          <Button
                            variant="outline-secondary"
                            className="btn btn-outline-secondary btn-lg w-100"
                            onClick={handleResetFilters}
                            title="Xóa bộ lọc học sinh"
                          >
                            <i className="fas fa-redo me-2"></i>
                            Đặt lại
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Student Filter Summary */}
                    {hasActiveStudentFilters() && (
                      <div className="row mt-3">
                        <div className="col-12">
                          <div className="alert alert-success mb-0">
                            <i className="fas fa-info-circle me-2"></i>
                            Tìm thấy <strong>{filteredStudents.length}</strong> học sinh
                            {nameFilter.trim() !== "" && (
                              <span> có tên chứa "<strong>{nameFilter}</strong>"</span>
                            )}
                            {classFilter.trim() !== "" && (
                              <span> thuộc lớp "<strong>{classFilter}</strong>"</span>
                            )}
                            {responseFilter !== "" && (
                              <span> với phản hồi <strong>
                                {responseFilter === 'APPROVED' && 'Đã đồng ý'}
                                {responseFilter === 'REJECTED' && 'Đã từ chối'}
                                {responseFilter === 'PENDING' && 'Chờ phản hồi'}
                              </strong></span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* Consent Details Modal - Redesigned */}
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
              <div className="feedback-info-section">
                <div className="feedback-info-header">
                  <div className="feedback-student-info">
                    <p><strong>Học sinh:</strong> {selectedConsent.studentName}</p>
                    <p><strong>Chiến dịch:</strong> {selectedConsent.campaignTitle}</p>
                  </div>
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConsentModal(false)} className="btn-close-custom">
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
