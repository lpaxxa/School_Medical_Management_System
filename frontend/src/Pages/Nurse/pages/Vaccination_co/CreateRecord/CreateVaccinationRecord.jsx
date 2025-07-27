import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import { Card, Spinner, Alert, Row, Col, Badge, Button, Form, InputGroup, Pagination } from 'react-bootstrap';
import CreateRecordModal from './CreateRecordModal';

const CreateVaccinationRecord = () => {
  const navigate = useNavigate();
  const {
    vaccinationPlans,
    loading,
    error,
    // Create Record Modal
    showCreateRecordModal,
    studentForRecord,
    handleCloseCreateRecordModal,
  } = useVaccination();



  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;



  // Save and restore scroll position
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('createVaccinationRecordScrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
    }

    const handleScroll = () => {
      sessionStorage.setItem('createVaccinationRecordScrollPosition', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save filter state
  useEffect(() => {
    sessionStorage.setItem('createVaccinationRecordFilters', JSON.stringify({
      searchTerm,
      statusFilter,
      dateRange,
      currentPage
    }));
  }, [searchTerm, statusFilter, dateRange, currentPage]);

  // Restore filter state on mount
  useEffect(() => {
    const savedFilters = sessionStorage.getItem('createVaccinationRecordFilters');
    if (savedFilters) {
      try {
        const { searchTerm: savedSearchTerm, statusFilter: savedStatusFilter, dateRange: savedDateRange, currentPage: savedCurrentPage } = JSON.parse(savedFilters);
        setSearchTerm(savedSearchTerm || '');
        setStatusFilter(savedStatusFilter || '');
        setDateRange(savedDateRange || { startDate: '', endDate: '' });
        setCurrentPage(savedCurrentPage || 1);
      } catch (error) {
        console.error('Error restoring filters:', error);
      }
    }
  }, []);

  const filteredPlans = useMemo(() => {
    return vaccinationPlans
      .filter(plan => {
        // Filter by name
        return plan.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter(plan => {
        // Filter by status
        return statusFilter ? plan.status === statusFilter : true;
      })
      .filter(plan => {
        // Filter by date range (using vaccinationDate)
        const { startDate, endDate } = dateRange;
        if (!startDate || !endDate) return true;
        const planDate = new Date(plan.vaccinationDate);
        return planDate >= new Date(startDate) && planDate <= new Date(endDate);
      })
      .sort((a, b) => {
        // Sort by vaccinationDate (newest first)
        return new Date(b.vaccinationDate) - new Date(a.vaccinationDate);
      });
  }, [vaccinationPlans, searchTerm, statusFilter, dateRange]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = filteredPlans.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => {
        const newRange = { ...prev, [name]: value };
        // Basic validation: if end date is before start date, clear end date
        if (name === 'startDate' && newRange.endDate && new Date(newRange.endDate) < new Date(value)) {
            newRange.endDate = '';
        }
        return newRange;
    });
  };

  // Check if any filters are applied
  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() !== '' ||
           statusFilter !== '' ||
           dateRange.startDate !== '' ||
           dateRange.endDate !== '';
  }, [searchTerm, statusFilter, dateRange]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateRange({ startDate: '', endDate: '' });
    setCurrentPage(1);
    // Clear saved filters
    sessionStorage.removeItem('createVaccinationRecordFilters');
  };

  // Function to handle showing details by navigating to detail page
  const handleShowDetailsWithScroll = (planId) => {
    navigate(`/nurse/vaccination/plan-detail/${planId}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WAITING_PARENT':
        return <Badge bg="warning">Chờ phụ huynh xác nhận</Badge>;
      case 'IN_PROGRESS':
        return <Badge bg="info">Đang tiến hành</Badge>;
      case 'COMPLETED':
        return <Badge bg="success">Hoàn thành</Badge>;
      case 'CANCELED':
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Helper function to format date from backend
  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    try {
      let date;

      // Handle array format from backend [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateInput)) {
        if (dateInput.length >= 3) {
          // Month is 0-indexed in JavaScript Date constructor
          const year = dateInput[0];
          const month = dateInput[1] - 1; // Convert to 0-indexed
          const day = dateInput[2];
          const hour = dateInput[3] || 0;
          const minute = dateInput[4] || 0;
          const second = dateInput[5] || 0;
          const nanosecond = dateInput[6] || 0;
          // Convert nanoseconds to milliseconds for JavaScript Date
          const millisecond = Math.floor(nanosecond / 1000000);

          date = new Date(year, month, day, hour, minute, second, millisecond);
        } else {
          return 'Ngày không hợp lệ';
        }
      }
      // Handle string format
      else if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      }
      // Handle Date object
      else if (dateInput instanceof Date) {
        date = dateInput;
      }
      else {
        return 'Ngày không hợp lệ';
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }

      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return date.toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error('Error formatting date:', error, dateInput);
      return 'Ngày không hợp lệ';
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Đang tải danh sách kế hoạch tiêm chủng...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <style>
        {`
          /* Fix dropdown arrow for Form.Select */
          .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e") !important;
            background-repeat: no-repeat !important;
            background-position: right 0.75rem center !important;
            background-size: 16px 12px !important;
            padding-right: 2.25rem !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }

          .form-select:focus {
            border-color: #86b7fe !important;
            outline: 0 !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          }

          .form-select:disabled {
            background-color: #e9ecef !important;
            opacity: 1 !important;
          }

          .vaccination-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 32px;
          }

          @media (max-width: 992px) {
            .vaccination-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 576px) {
            .vaccination-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
      <div>
        {/* Filter Section */}
        <Card className="p-3 mb-4">
          <Row className="g-3">
            <Col md={3}>
              <Form.Group controlId="searchTerm">
                <Form.Label>Tìm theo tên kế hoạch</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="statusFilter">
                <Form.Label>Lọc theo trạng thái</Form.Label>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="WAITING_PARENT">Chờ phụ huynh</option>
                  <option value="IN_PROGRESS">Đang tiến hành</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELED">Đã hủy</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Label>Lọc theo ngày tiêm</Form.Label>
                <InputGroup>
                    <Form.Control
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                    />
                    <InputGroup.Text>đến</InputGroup.Text>
                    <Form.Control
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        min={dateRange.startDate}
                    />
                </InputGroup>
            </Col>
            {hasActiveFilters && (
              <Col md={2} className="d-flex align-items-end">
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={handleResetFilters}
                  style={{ height: '38px' }}
                >
                  <i className="fas fa-undo me-2"></i>
                  Đặt lại
                </Button>
              </Col>
            )}
          </Row>
        </Card>

        {filteredPlans.length === 0 ? (
          <Alert variant="info">Không có kế hoạch tiêm chủng nào phù hợp với tiêu chí.</Alert>
        ) : (
          <>
            <div className="vaccination-grid">
              {currentPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="h-100 shadow-sm border-0"
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '280px'
                  }}
                >
                  {/* Card Header */}
                  <Card.Body className="p-4" style={{ flexGrow: 1 }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0 fw-bold" style={{
                        fontSize: '1.1rem',
                        color: '#1f2937',
                        lineHeight: '1.4',
                        flex: 1,
                        marginRight: '12px'
                      }}>
                        {plan.name}
                      </h5>
                      <span 
                        className="badge fw-bold text-white px-2 py-1"
                        style={{
                          backgroundColor: '#f97316',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          flexShrink: 0
                        }}
                      >
                        ID: {plan.id}
                      </span>
                    </div>

                    <p className="text-muted mb-3" style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {plan.description}
                    </p>

                    <div className="mb-2" style={{ fontSize: '0.875rem' }}>
                      <span style={{ marginRight: '8px' }}>📅</span>
                      <strong>Ngày tiêm:</strong> {formatDate(plan.vaccinationDate)}
                    </div>
                    
                    <div className="mb-2" style={{ fontSize: '0.875rem' }}>
                      <span style={{ marginRight: '8px' }}>⏰</span>
                      <strong>Hạn chót đăng ký:</strong> {formatDate(plan.deadlineDate)}
                    </div>
                    
                    <div className="mb-3" style={{ fontSize: '0.875rem' }}>
                      <span style={{ marginRight: '8px' }}>📝</span>
                      <strong>Trạng thái:</strong> 
                      <span className="ms-2 fw-bold" style={{
                        color: plan.status === 'IN_PROGRESS' ? '#0ea5e9' :
                               plan.status === 'WAITING_PARENT' ? '#f59e0b' :
                               plan.status === 'COMPLETED' ? '#10b981' : '#ef4444'
                      }}>
                        {plan.status === 'IN_PROGRESS' ? 'Đang tiến hành' :
                         plan.status === 'WAITING_PARENT' ? 'Chờ phụ huynh xác nhận' :
                         plan.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                      </span>
                    </div>
                  </Card.Body>

                  {/* Card Footer */}
                  <Card.Footer className="bg-transparent border-0 p-4 pt-0">
                    <Button
                      className="w-100 fw-medium border-0"
                      onClick={() => handleShowDetailsWithScroll(plan.id)}
                      style={{
                        background: 'linear-gradient(to right, #38bdf8, #3b82f6)',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '0.875rem',
                        transition: 'opacity 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                      title={
                        (plan.status === 'COMPLETED' || plan.status === 'CANCELED')
                          ? `Kế hoạch đã ${plan.status === 'COMPLETED' ? 'hoàn thành' : 'bị hủy'} - Không thể tạo hồ sơ mới`
                          : 'Xem chi tiết kế hoạch tiêm chủng'
                      }
                    >
                      <span style={{ marginRight: '8px' }}>👁</span>
                      Xem chi tiết
                    </Button>
                  </Card.Footer>
                </Card>
              ))}
            </div>

            {/* Simple Pagination with "1 / 3" style */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                {/* Showing entries info */}
                <div className="text-muted">
                  <small>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredPlans.length)} of {filteredPlans.length} vaccination plans
                  </small>
                </div>

                {/* Pagination controls */}
                <div className="d-flex align-items-center gap-2">
                  {/* First page button */}
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    title="Trang đầu"
                    style={{ minWidth: '40px' }}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>

                  {/* Previous page button */}
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
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
                    onClick={() => setCurrentPage(currentPage + 1)}
                    title="Trang tiếp"
                    style={{ minWidth: '40px' }}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>

                  {/* Last page button */}
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Trang cuối"
                    style={{ minWidth: '40px' }}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* This modal is also managed here */}
      <CreateRecordModal
        show={showCreateRecordModal}
        handleClose={handleCloseCreateRecordModal}
        student={studentForRecord}
      />
    </>
  );
};

export default CreateVaccinationRecord; 