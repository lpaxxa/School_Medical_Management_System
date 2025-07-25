import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Table, Spinner, Alert, Badge, Form, Row, Col } from 'react-bootstrap';
import { 
  FaArrowLeft, 
  FaSyringe, 
  FaInfoCircle,
  FaPlus,
  FaEdit
} from 'react-icons/fa';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import CreateRecordModal from './CreateRecordModal';
import { 
  calculateStudentsMonitoringStatus, 
  canCreateVaccinationRecord, 
  getVaccinationRecordStatusText, 
  getVaccinationRecordStatusColor 
} from './monitoringStatusUtils';
import Swal from 'sweetalert2';

const VaccinationPlanDetailPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { 
    fetchPlanDetails, 
    showCreateRecordModal,
    studentForRecord,
    handleCloseCreateRecordModal,
    handleShowCreateRecordModal
  } = useVaccination();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [planDetails, setPlanDetails] = useState(null);
  const [monitoringStatuses, setMonitoringStatuses] = useState({});
  const [monitoringStatusLoading, setMonitoringStatusLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [responseFilter, setResponseFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Load plan details
  useEffect(() => {
    const loadPlanData = async () => {
      if (!planId) {
        setError('ID kế hoạch không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const planData = await fetchPlanDetails(parseInt(planId));
        
        if (!planData) {
          setError('Không tìm thấy kế hoạch tiêm chủng');
          setLoading(false);
          return;
        }

        setPlanDetails(planData);
        
      } catch (err) {
        setError('Lỗi tải dữ liệu kế hoạch tiêm chủng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPlanData();
  }, [planId, fetchPlanDetails]);

  // Load monitoring statuses when plan details change
  useEffect(() => {
    const loadMonitoringStatuses = async () => {
      if (!planDetails?.students || !planDetails?.vaccinationDate) return;
      
      setMonitoringStatusLoading(true);
      try {
        const statuses = await calculateStudentsMonitoringStatus(
          planDetails.students, 
          planDetails.vaccinationDate
        );
        setMonitoringStatuses(statuses);
      } catch (error) {
        console.error('Error loading monitoring statuses:', error);
      } finally {
        setMonitoringStatusLoading(false);
      }
    };

    loadMonitoringStatuses();
  }, [planDetails?.students, planDetails?.vaccinationDate]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/nurse/vaccination/create-record');
  };

  // Handle create record
  const handleCreateRecord = (student) => {
    handleShowCreateRecordModal(student);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const color = getVaccinationRecordStatusColor(status);
    const text = getVaccinationRecordStatusText(status);
    
    return (
      <Badge 
        style={{ 
          backgroundColor: color, 
          color: 'white',
          fontSize: '0.75rem',
          padding: '0.25rem 0.5rem'
        }}
      >
        {text}
      </Badge>
    );
  };

  // Get response badge
  const getResponseBadge = (response) => {
    switch (response) {
      case 'ACCEPTED':
        return <Badge bg="success">Đồng ý</Badge>;
      case 'REJECTED':
        return <Badge bg="danger">Từ chối</Badge>;
      case 'PENDING':
        return <Badge bg="secondary">Chờ phản hồi</Badge>;
      default:
        return <Badge bg="light" text="dark">{response || 'Chưa có'}</Badge>;
    }
  };

  // Render action buttons
  const renderActionButtons = (student) => {
    const status = monitoringStatuses[student.healthProfileId] || 'Đang kiểm tra...';
    const canCreate = canCreateVaccinationRecord(status);

    // Kiểm tra phản hồi phụ huynh - chỉ hiển thị nút khi có ít nhất 1 vaccine được ACCEPTED
    const hasAcceptedResponse = student.vaccineResponses?.some(response =>
      response.response === 'ACCEPTED'
    );

    if (!hasAcceptedResponse) {
      return (
        <Badge bg="warning" text="dark">
          Chờ phụ huynh đồng ý
        </Badge>
      );
    }

    if (canCreate) {
      return (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => handleCreateRecord(student)}
        >
          <FaPlus className="me-1" />
          Tạo hồ sơ
        </Button>
      );
    } else {
      return (
        <Button variant="outline-secondary" size="sm" disabled>
          <FaEdit className="me-1" />
          Đã có hồ sơ
        </Button>
      );
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!planDetails?.students) return [];

    return planDetails.students.filter(student => {
      const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase());

      const studentStatus = monitoringStatuses[student.healthProfileId] || 'Đang kiểm tra...';
      const matchesStatus = !statusFilter || studentStatus === statusFilter;

      // Filter by response status
      const matchesResponse = !responseFilter ||
        student.vaccineResponses?.some(response =>
          response.response === responseFilter
        );

      return matchesSearch && matchesStatus && matchesResponse;
    });
  }, [planDetails?.students, searchTerm, statusFilter, responseFilter, monitoringStatuses]);

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="me-2"
        >
          Trước
        </Button>
        
        {pageNumbers.map(number => (
          <Button
            key={number}
            variant={currentPage === number ? "primary" : "outline-primary"}
            size="sm"
            onClick={() => setCurrentPage(number)}
            className="me-1"
          >
            {number}
          </Button>
        ))}
        
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ms-1"
        >
          Sau
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Đang tải dữ liệu kế hoạch tiêm chủng...</p>
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

  if (!planDetails) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h5>Không tìm thấy kế hoạch tiêm chủng</h5>
          <p>Kế hoạch với ID {planId} không tồn tại.</p>
          <Button variant="outline-warning" onClick={handleBack}>
            <FaArrowLeft className="me-2" />
            Quay lại danh sách
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="vaccination-plan-detail-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={handleBack} className="mb-2">
            <FaArrowLeft className="me-2" />
            Quay lại danh sách
          </Button>
          <h2 className="mb-0">
            <FaSyringe className="me-2" />
            Chi tiết kế hoạch: {planDetails.name}
          </h2>
        </div>
      </div>

      {/* Plan Info Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Thông tin kế hoạch tiêm chủng</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Tên kế hoạch:</strong> {planDetails.name}</p>
              <p><strong>Mô tả:</strong> {planDetails.description}</p>
              <p><strong>Ngày tiêm:</strong> {formatDate(planDetails.vaccinationDate)}</p>
            </Col>
            <Col md={6}>
              <p><strong>Trạng thái:</strong> {planDetails.status}</p>
              <p><strong>Vaccine sử dụng:</strong></p>
              <ul>
                {planDetails.vaccines?.map((vaccine, index) => (
                  <li key={vaccine.id || index}>
                    {vaccine.name}
                    {vaccine.description && `: ${vaccine.description}`}
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Students List */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Danh sách học sinh ({filteredStudents.length} học sinh)</h5>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Tìm theo tên học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Chưa hoàn thành">Chưa tạo HS</option>
                <option value="Cần theo dõi">Đã tạo HS - Cần theo dõi</option>
                <option value="Hoàn thành">Đã tạo HS - Hoàn thành</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={responseFilter}
                onChange={(e) => setResponseFilter(e.target.value)}
              >
                <option value="">Tất cả phản hồi</option>
                <option value="ACCEPTED">Đồng ý</option>
                <option value="REJECTED">Từ chối</option>
                <option value="PENDING">Chờ phản hồi</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Students Table */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên học sinh</th>
                <th>Lớp</th>
                <th>Phản hồi PH</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, index) => {
                const status = monitoringStatuses[student.healthProfileId] || 'Đang kiểm tra...';

                return (
                  <tr key={student.healthProfileId}>
                    <td>{indexOfFirstStudent + index + 1}</td>
                    <td>{student.fullName}</td>
                    <td>{student.className}</td>
                    <td>
                      {student.vaccineResponses?.map(response => (
                        <div key={response.vaccineId} className="mb-1">
                          {getResponseBadge(response.response)}
                        </div>
                      ))}
                    </td>
                    <td>
                      {monitoringStatusLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        getStatusBadge(status)
                      )}
                    </td>
                    <td>
                      {renderActionButtons(student)}
                    </td>
                  </tr>
                );
              })}
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

      {/* Create Record Modal */}
      <CreateRecordModal 
        show={showCreateRecordModal}
        handleClose={handleCloseCreateRecordModal}
        student={studentForRecord}
        plan={planDetails}
      />
    </Container>
  );
};

export default VaccinationPlanDetailPage;
