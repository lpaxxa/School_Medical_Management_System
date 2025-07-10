import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Container, Row, Col, Spinner, Alert, Form, InputGroup, Pagination } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import StudentListModal from './StudentListModal';
import HistoryModal from './HistoryModal';
import UpdateNoteModal from './UpdateNoteModal';

const PostVaccinationMonitoring = () => {
  const { vaccinationPlans, loading, error, fetchPlanDetails, handleShowStudentListModal } = useVaccination();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Save and restore scroll position
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('postVaccinationMonitoringScrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
    }

    const handleScroll = () => {
      sessionStorage.setItem('postVaccinationMonitoringScrollPosition', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save filter state
  useEffect(() => {
    sessionStorage.setItem('postVaccinationMonitoringFilters', JSON.stringify({
      searchTerm,
      dateRange,
      currentPage
    }));
  }, [searchTerm, dateRange, currentPage]);

  // Restore filter state on mount
  useEffect(() => {
    const savedFilters = sessionStorage.getItem('postVaccinationMonitoringFilters');
    if (savedFilters) {
      try {
        const { searchTerm: savedSearchTerm, dateRange: savedDateRange, currentPage: savedCurrentPage } = JSON.parse(savedFilters);
        setSearchTerm(savedSearchTerm || '');
        setDateRange(savedDateRange || { startDate: '', endDate: '' });
        setCurrentPage(savedCurrentPage || 1);
      } catch (error) {
        console.error('Error restoring filters:', error);
      }
    }
  }, []);

  // Filtered and sorted plans
  const filteredPlans = useMemo(() => {
    return vaccinationPlans
      .filter(plan => {
        // Filter by name
        return plan.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter(plan => {
        // Filter by date range
        const { startDate, endDate } = dateRange;
        if (!startDate || !endDate) return true;
        const planDate = new Date(plan.vaccinationDate);
        return planDate >= new Date(startDate) && planDate <= new Date(endDate);
      })
      .sort((a, b) => {
        // Sort by vaccinationDate (newest first)
        return new Date(b.vaccinationDate) - new Date(a.vaccinationDate);
      });
  }, [vaccinationPlans, searchTerm, dateRange]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = filteredPlans.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange]);

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

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateRange({ startDate: '', endDate: '' });
    setCurrentPage(1);
    // Clear saved filters
    sessionStorage.removeItem('postVaccinationMonitoringFilters');
  };

  const handleViewDetails = async (planId) => {
    // First, fetch the full plan details which include the list of students.
    const fullPlanDetails = await fetchPlanDetails(planId);
    
    // If the details are fetched successfully, show the student list modal.
    if (fullPlanDetails) {
      handleShowStudentListModal(fullPlanDetails);
    } else {
      // Handle the case where details couldn't be fetched, perhaps show a toast.
      console.error("Could not fetch plan details to show student list.");
    }
  };

  if (loading) {
    return (
      <Container className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Đang tải danh sách kế hoạch...</p>
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!vaccinationPlans || vaccinationPlans.length === 0) {
    return <Alert variant="info">Không có kế hoạch tiêm chủng nào để hiển thị.</Alert>;
  }

  return (
    <Container fluid>
      <style>
        {`
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
      <h2 className="mb-4">Theo dõi sau tiêm</h2>
      
      {/* Filter Section */}
      <Card className="p-3 mb-4">
        <Row className="g-3">
          <Col md={5}>
            <Form.Group controlId="searchTerm">
              <Form.Label>Tìm theo tên chiến dịch</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên chiến dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={5}>
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
        </Row>
      </Card>

      {filteredPlans.length === 0 ? (
        <Alert variant="info">Không có kế hoạch tiêm chủng nào phù hợp với tiêu chí tìm kiếm.</Alert>
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
                    <strong>Ngày tiêm:</strong> {new Date(plan.vaccinationDate).toLocaleDateString('vi-VN')}
                  </div>
                  
                  <div className="mb-2" style={{ fontSize: '0.875rem' }}>
                    <span style={{ marginRight: '8px' }}>⏰</span>
                    <strong>Hạn chót đăng ký:</strong> {new Date(plan.deadlineDate).toLocaleString('vi-VN')}
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
                    onClick={() => handleViewDetails(plan.id)}
                    style={{
                      background: 'linear-gradient(to right, #38bdf8, #3b82f6)',
                      borderRadius: '6px',
                      padding: '10px',
                      fontSize: '0.875rem',
                      transition: 'opacity 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    <span style={{ marginRight: '8px' }}>👁</span>
                    Xem chi tiết
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First 
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Show first page, last page, current page, and 2 pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return <Pagination.Ellipsis key={page} />;
                  }
                  return null;
                })}
                
                <Pagination.Next 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-center mt-2 text-muted">
            <small>
              Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredPlans.length)} trong tổng số {filteredPlans.length} kế hoạch
            </small>
          </div>
        </>
      )}

      {/* Modals for the Post-Monitoring Flow */}
      <StudentListModal />
      <HistoryModal />
      <UpdateNoteModal />
    </Container>
  );
};

export default PostVaccinationMonitoring;