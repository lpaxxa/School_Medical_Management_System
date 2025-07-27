import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import HistoryModal from './HistoryModal';
import UpdateNoteModal from './UpdateNoteModal';
import CustomPagination from './CustomPagination';
import vaccinationApiService from '../../../../../services/APINurse/vaccinationApiService';

// Utility function to format date - moved outside component for reuse
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

const PostVaccinationMonitoring = () => {
  const navigate = useNavigate();
  const {
    vaccinationPlans,
    loading,
    error,
    fetchPlanDetails,
    handleShowHistoryModal
  } = useVaccination();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Detail states
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  
  // Student statuses for the selected plan
  const [studentStatuses, setStudentStatuses] = useState({});
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Overall status for each plan
  const [planOverallStatuses, setPlanOverallStatuses] = useState({});
  const [planStatusesLoading, setPlanStatusesLoading] = useState(false);

  // Filter states for student details
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('');
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Function to calculate overall status for a plan
  const calculateOverallStatus = (planId, statuses, students) => {
    if (!students || students.length === 0) {
      return 'Chưa có học sinh';
    }

    const statusCounts = {
      'Hoàn thành': 0,
      'Cần theo dõi': 0,
      'Chưa hoàn thành': 0
    };

    students.forEach(student => {
      const status = statuses[student.healthProfileId] || 'Cần theo dõi';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    const total = students.length;
    const completed = statusCounts['Hoàn thành'];
    const needMonitoring = statusCounts['Cần theo dõi'];
    const notCompleted = statusCounts['Chưa hoàn thành'];

    // Logic theo yêu cầu
    if (completed === total) {
      return 'Hoàn thành';
    } else if (notCompleted > 0 && needMonitoring > 0) {
      return 'Còn học sinh cần theo dõi và chưa hoàn thành';
    } else if (needMonitoring > 0) {
      return 'Còn học sinh cần theo dõi';
    } else if (notCompleted > 0) {
      return 'Chưa hoàn thành';
    } else {
      return 'Cần theo dõi';
    }
  };

  // Function to calculate status for a single plan
  const calculateStatusForSinglePlan = async (plan) => {
    try {
      const statuses = {};
      if (plan && plan.students) {
        for (const student of plan.students) {
          try {
            const history = await vaccinationApiService.getAllVaccinationByHealthProfileId(student.healthProfileId);
            
            // Filter by vaccination date
            const vaccinationDate = new Date(plan.vaccinationDate);
            const filteredHistory = history.filter(record => {
              const recordDate = new Date(record.vaccinationDate);
              return recordDate.toDateString() === vaccinationDate.toDateString();
            });
            
            // Calculate status based on notes
            if (filteredHistory.length === 0) {
              statuses[student.healthProfileId] = 'Chưa hoàn thành';
            } else {
              const allCompleted = filteredHistory.every(record => {
                const notes = record.notes;
                return notes && notes.toLowerCase().trim().includes('không có phản ứng phụ');
              });
              
              if (allCompleted) {
                statuses[student.healthProfileId] = 'Hoàn thành';
              } else {
                statuses[student.healthProfileId] = 'Cần theo dõi';
              }
            }
          } catch (error) {
            console.error(`Could not fetch status for student ${student.fullName}`, error);
            statuses[student.healthProfileId] = 'Cần theo dõi';
          }
        }
      }
      
      return calculateOverallStatus(plan.id, statuses, plan.students);
    } catch (error) {
      console.error(`Error calculating status for plan ${plan.id}:`, error);
      return 'Cần theo dõi';
    }
  };

  // Function to load all plan statuses
  const loadAllPlanStatuses = async () => {
    if (!vaccinationPlans || vaccinationPlans.length === 0) return;
    
    setPlanStatusesLoading(true);
    
    // Process plans in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < vaccinationPlans.length; i += batchSize) {
      const batch = vaccinationPlans.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (plan) => {
        try {
          const planWithDetails = await fetchPlanDetails(plan.id);
          if (planWithDetails) {
            const status = await calculateStatusForSinglePlan(planWithDetails);
            return { planId: plan.id, status };
          }
        } catch (error) {
          console.error(`Error processing plan ${plan.id}:`, error);
        }
        return { planId: plan.id, status: 'Cần theo dõi' };
      });
      
      const batchResults = await Promise.all(batchPromises);
      const batchStatuses = {};
      batchResults.forEach(({ planId, status }) => {
        batchStatuses[planId] = status;
      });
      
      // Update UI after each batch
      setPlanOverallStatuses(prev => ({
        ...prev,
        ...batchStatuses
      }));
    }
    
    setPlanStatusesLoading(false);
  };

  // Load all plan statuses when vaccination plans are loaded
  useEffect(() => {
    if (vaccinationPlans && vaccinationPlans.length > 0) {
      loadAllPlanStatuses();
    }
  }, [vaccinationPlans]);

  // Function to get status color
  const getOverallStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return '#10b981'; // green
      case 'Còn học sinh cần theo dõi':
        return '#f59e0b'; // yellow
      case 'Chưa hoàn thành':
        return '#ef4444'; // red
      case 'Còn học sinh cần theo dõi và chưa hoàn thành':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  // Function to fetch student statuses for the current plan
  const fetchStudentStatuses = async (plan) => {
    setStatusLoading(true);
    
    const statuses = {};
    if (plan && plan.students) {
      for (const student of plan.students) {
        try {
          // Use the existing API that works with healthProfileId
          const history = await vaccinationApiService.getAllVaccinationByHealthProfileId(student.healthProfileId);
          
          // Filter by vaccination date
          const vaccinationDate = new Date(plan.vaccinationDate);
          const filteredHistory = history.filter(record => {
            const recordDate = new Date(record.vaccinationDate);
            return recordDate.toDateString() === vaccinationDate.toDateString();
          });
          
          // Calculate status based on notes
          if (filteredHistory.length === 0) {
            statuses[student.healthProfileId] = 'Chưa hoàn thành';
          } else {
            // Check if all records have "không có phản ứng phụ" in notes
            const allCompleted = filteredHistory.every(record => {
              const notes = record.notes;
              return notes && notes.toLowerCase().trim().includes('không có phản ứng phụ');
            });
            
            if (allCompleted) {
              statuses[student.healthProfileId] = 'Hoàn thành';
            } else {
              statuses[student.healthProfileId] = 'Cần theo dõi';
            }
          }
        } catch (error) {
          console.error(`Could not fetch status for student ${student.fullName}`, error);
          // Set default status when API fails
          statuses[student.healthProfileId] = 'Cần theo dõi';
        }
      }
    }
    setStudentStatuses(statuses);
    setStatusLoading(false);
    
    // Calculate and update overall status for this plan
    const overallStatus = calculateOverallStatus(plan.id, statuses, plan.students);
    setPlanOverallStatuses(prev => ({
      ...prev,
      [plan.id]: overallStatus
    }));
  };

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
      statusFilter,
      currentPage
    }));
  }, [searchTerm, dateRange, statusFilter, currentPage]);

  // Restore filter state on mount
  useEffect(() => {
    const savedFilters = sessionStorage.getItem('postVaccinationMonitoringFilters');
    if (savedFilters) {
      try {
        const { searchTerm: savedSearchTerm, dateRange: savedDateRange, statusFilter: savedStatusFilter, currentPage: savedCurrentPage } = JSON.parse(savedFilters);
        setSearchTerm(savedSearchTerm || '');
        setDateRange(savedDateRange || { startDate: '', endDate: '' });
        setStatusFilter(savedStatusFilter || '');
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
      .filter(plan => {
        // Filter by status
        if (!statusFilter) return true;
        const overallStatus = planOverallStatuses[plan.id];
        return overallStatus === statusFilter;
      })
      .sort((a, b) => {
        // Sort by vaccinationDate (newest first)
        return new Date(b.vaccinationDate) - new Date(a.vaccinationDate);
      });
  }, [vaccinationPlans, searchTerm, dateRange, statusFilter, planOverallStatuses]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = filteredPlans.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange, statusFilter]);

  // Reset student page when student filters change
  useEffect(() => {
    setStudentCurrentPage(1);
  }, [studentSearchTerm, studentStatusFilter]);

  // Filtered students for detail view
  const filteredStudents = useMemo(() => {
    if (!planDetails || !planDetails.students) return [];
    
    return planDetails.students.filter(student => {
      // Filter by student name
      const matchesName = student.fullName.toLowerCase().includes(studentSearchTerm.toLowerCase());
      
      // Filter by status
      const studentStatus = studentStatuses[student.healthProfileId] || 'Cần theo dõi';
      const matchesStatus = !studentStatusFilter || studentStatus === studentStatusFilter;
      
      return matchesName && matchesStatus;
    });
  }, [planDetails, studentSearchTerm, studentStatusFilter, studentStatuses]);

  // Pagination for students
  const totalStudentPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const studentStartIndex = (studentCurrentPage - 1) * studentsPerPage;
  const studentEndIndex = studentStartIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(studentStartIndex, studentEndIndex);

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
    setDateRange({ startDate: '', endDate: '' });
    setStatusFilter('');
    setCurrentPage(1);
    // Clear saved filters
    sessionStorage.removeItem('postVaccinationMonitoringFilters');
  };

  const handleResetStudentFilters = () => {
    setStudentSearchTerm('');
    setStudentStatusFilter('');
    setStudentCurrentPage(1);
  };

  const handleViewDetails = (planId) => {
    navigate(`/nurse/vaccination/monitoring-detail/${planId}`);
  };

  const handleCloseDetails = () => {
    setSelectedPlan(null);
    setPlanDetails(null);
    setDetailsError(null);
    setStudentStatuses({});
    // Reset student filters
    setStudentSearchTerm('');
    setStudentStatusFilter('');
    setStudentCurrentPage(1);
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
          <Col md={3}>
            <Form.Group controlId="searchTerm">
              <Form.Label>Tìm theo tên chiến dịch</Form.Label>
              <Form.Control
                type="text"
                placeholder="🔍 Nhập tên chiến dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="statusFilter">
              <Form.Label>Lọc theo tình trạng</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả tình trạng</option>
                <option value="Hoàn thành">✅ Hoàn thành</option>
                <option value="Còn học sinh cần theo dõi">⚠️ Còn học sinh cần theo dõi</option>
                <option value="Chưa hoàn thành">❌ Chưa hoàn thành</option>
                <option value="Còn học sinh cần theo dõi và chưa hoàn thành">🔴 Còn học sinh cần theo dõi và chưa hoàn thành</option>
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
                  
                  <div className="mb-3" style={{ fontSize: '0.875rem' }}>
                    <span style={{ marginRight: '8px' }}>📊</span>
                    <strong>Tình trạng:</strong> 
                    <span className="ms-2 fw-bold" style={{
                      color: getOverallStatusColor(planOverallStatuses[plan.id])
                    }}>
                      {planStatusesLoading && !planOverallStatuses[plan.id] ? (
                        <span style={{ color: '#6b7280' }}>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang tải...
                        </span>
                      ) : (
                        planOverallStatuses[plan.id] || 'Chưa kiểm tra'
                      )}
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

          {/* Custom Pagination */}
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredPlans.length}
            itemName="vaccination plans"
          />


        </>
      )}

      {/* Modals for the Post-Monitoring Flow */}
      <HistoryModal />
      <UpdateNoteModal />
    </Container>
  );
};

export default PostVaccinationMonitoring;