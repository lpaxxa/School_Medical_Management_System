import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Table, Spinner, Alert, Badge, Form, Row, Col } from 'react-bootstrap';
import { 
  FaArrowLeft, 
  FaSyringe, 
  FaEye,
  FaEdit
} from 'react-icons/fa';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import HistoryModal from './HistoryModal';
import UpdateNoteModal from './UpdateNoteModal';
import vaccinationApiService from '../../../../../services/APINurse/vaccinationApiService';
import Swal from 'sweetalert2';

const PostVaccinationDetailPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { 
    fetchPlanDetails,
    handleShowHistoryModal,
    handleShowUpdateNoteModal
  } = useVaccination();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Data states
  const [planDetails, setPlanDetails] = useState(null);
  const [studentStatuses, setStudentStatuses] = useState({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  // Load student statuses when plan details change
  useEffect(() => {
    const fetchStudentStatuses = async () => {
      if (!planDetails?.students) return;
      
      setStatusLoading(true);
      const statuses = {};
      
      for (const student of planDetails.students) {
        try {
          const history = await vaccinationApiService.getAllVaccinationByHealthProfileId(student.healthProfileId);
          
          // Filter by vaccination date
          const vaccinationDate = new Date(planDetails.vaccinationDate);
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
          statuses[student.healthProfileId] = 'Chưa hoàn thành'; // Default to 'Chưa hoàn thành' when error occurs
        }
      }
      
      setStudentStatuses(statuses);
      setStatusLoading(false);
    };

    fetchStudentStatuses();
  }, [planDetails]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/nurse/vaccination/monitoring');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return <Badge bg="success">🟢 Hoàn thành</Badge>;
      case 'Cần theo dõi':
        return <Badge bg="warning" text="dark">🟡 Cần theo dõi</Badge>;
      case 'Chưa hoàn thành':
        return <Badge bg="danger">🔴 Chưa hoàn thành</Badge>;
      default:
        return <Badge bg="secondary">Đang kiểm tra...</Badge>;
    }
  };

  // Handle view history
  const handleViewHistory = (student) => {
    handleShowHistoryModal({
      ...student,
      studentId: student.id || student.healthProfileId,
      studentName: student.fullName
    }, planDetails.vaccinationDate);
  };

  // Filter students - only show students who have vaccination records
  const filteredStudents = useMemo(() => {
    if (!planDetails?.students) return [];

    return planDetails.students.filter(student => {
      const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase());

      const studentStatus = studentStatuses[student.healthProfileId] || 'Chưa hoàn thành';

      // Only show students who have vaccination records (not 'Chưa hoàn thành')
      const hasVaccinationRecord = studentStatus !== 'Chưa hoàn thành';

      const matchesStatus = !statusFilter || studentStatus === statusFilter;

      return matchesSearch && matchesStatus && hasVaccinationRecord;
    });
  }, [planDetails?.students, searchTerm, statusFilter, studentStatuses]);

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
    <Container fluid className="post-vaccination-detail-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={handleBack} className="mb-2">
            <FaArrowLeft className="me-2" />
            Quay lại danh sách
          </Button>
          <h2 className="mb-0">
            <FaSyringe className="me-2" />
            Theo dõi sau tiêm: {planDetails.name}
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
          <h5 className="mb-0">Danh sách học sinh theo dõi ({filteredStudents.length} học sinh)</h5>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Tìm theo tên học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Cần theo dõi">Cần theo dõi</option>
                <option value="Hoàn thành">Hoàn thành</option>
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
                <th>Trạng thái theo dõi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, index) => {
                const status = studentStatuses[student.healthProfileId] || 'Chưa hoàn thành';
                
                return (
                  <tr key={student.healthProfileId}>
                    <td>{indexOfFirstStudent + index + 1}</td>
                    <td>{student.fullName}</td>
                    <td>{student.className}</td>
                    <td>
                      {statusLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        getStatusBadge(status)
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleViewHistory(student)}
                        className="me-2"
                      >
                        <FaEye className="me-1" />
                        Xem lịch sử
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">
                {planDetails?.students?.length > 0
                  ? "Không có học sinh nào có lịch sử tiêm chủng cần theo dõi."
                  : "Không có học sinh nào phù hợp với bộ lọc."
                }
              </p>
            </div>
          )}

          {renderPagination()}
        </Card.Body>
      </Card>

      {/* Modals */}
      <HistoryModal />
      <UpdateNoteModal />
    </Container>
  );
};

export default PostVaccinationDetailPage;
