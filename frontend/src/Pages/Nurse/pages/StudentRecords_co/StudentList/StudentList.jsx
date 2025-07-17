import React, { useState, useEffect } from 'react';
import { useStudentRecords } from '../../../../../context/NurseContext/StudentRecordsContext';
import './StudentList.css';
import StudentDetail from '../StudentDetail/StudentDetail';
import { Form, Container, Card, Table, Button, InputGroup, Badge, Spinner, Alert, Pagination } from 'react-bootstrap';

const StudentList = () => {
  // Sử dụng context thay vì local state và API calls
  const {
    filteredStudents,
    loading,
    error,
    handleSearch,
    resetFilters,
    setSelectedStudent
  } = useStudentRecords();
  
  // Local state
  const [viewMode, setViewMode] = useState('list');
  const [selectedStudentLocal, setSelectedStudentLocal] = useState(null);
  
  // Local state cho form tìm kiếm
  const [keyword, setKeyword] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(''); // Thêm state cho khối
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  
  // Đồng bộ state tìm kiếm local với context khi component mount
  useEffect(() => {
    // Initialize with empty values since we removed searchCriteria
    setKeyword('');
    setSelectedClass('');
    setSelectedGrade('');
    setCurrentPage(1);
  }, []);

  // Thêm hàm xử lý cho Form.Control với tìm kiếm realtime
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'keyword':
        setKeyword(value);
        // Tìm kiếm realtime
        handleSearch({
          keyword: value,
          class: selectedClass,
          grade: selectedGrade
        });
        break;
      case 'class':
        setSelectedClass(value);
        // Tìm kiếm realtime
        handleSearch({
          keyword,
          class: value,
          grade: selectedGrade
        });
        break;
      case 'grade':
        setSelectedGrade(value);
        setCurrentPage(1); // Reset về trang 1 khi lọc theo khối
        // Tìm kiếm realtime
        handleSearch({
          keyword,
          class: selectedClass,
          grade: value
        });
        break;
      default:
        break;
    }
  };

  // Xử lý khi nhấn nút tìm kiếm - bỏ hàm này vì không cần thiết
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Không cần làm gì vì tìm kiếm đã realtime
  };
  
  // Xử lý khi nhấn nút Reset
  const handleResetFilters = () => {
    setKeyword('');
    setSelectedClass('');
    setSelectedGrade('');
    setCurrentPage(1);
    resetFilters();
  };

  // Xử lý khi nhấn vào một học sinh
  const handleViewStudent = (student) => {
    if (!student) {
      console.error('Không có thông tin học sinh hợp lệ');
      return;
    }
    
    // Đảm bảo giữ nguyên ID học sinh và healthProfileId
    const studentWithId = {
      ...student,
      // Không tự động thêm hoặc sửa ID, giữ nguyên ID từ API
    };
    
    console.log('Selected student (before modification):', student);
    console.log('Selected student (after modification):', studentWithId);
    setSelectedStudentLocal(studentWithId);
    setSelectedStudent(studentWithId);
    setViewMode('detail');
  };

  // Xử lý khi quay lại danh sách
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedStudentLocal(null);
    setSelectedStudent(null);
  };

  // Lọc dữ liệu theo khối
  const filterByGrade = (students, grade) => {
    if (!grade) return students;
    return students.filter(student => {
      const className = student.className || student.class || '';
      // Lấy số khối từ tên lớp (ví dụ: 12A1 -> 12, 3B2 -> 3)
      const classGrade = className.match(/^(\d+)/);
      return classGrade && classGrade[1] === grade;
    });
  };

  // Áp dụng bộ lọc khối cho danh sách học sinh
  const gradeFilteredStudents = filterByGrade(filteredStudents, selectedGrade);

  // Tính toán phân trang
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = gradeFilteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(gradeFilteredStudents.length / studentsPerPage);

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">
          <Alert.Heading>
            <i className="fas fa-exclamation-circle me-2"></i>
            Đã xảy ra lỗi
          </Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // Hiển thị chi tiết học sinh
  if (viewMode === 'detail' && selectedStudentLocal) {
    return (
      <StudentDetail 
        student={selectedStudentLocal} 
        onBack={handleBackToList}
      />
    );
  }

  // Hàm render bảng học sinh
  const renderStudentTable = () => {
    return (
      <div className="table-responsive">
        {currentStudents.length === 0 ? (
          <Card className="text-center p-5 my-4">
            <Card.Body>
              <i className="fas fa-search fa-3x mb-3 text-muted"></i>
              <Card.Title>Không tìm thấy kết quả</Card.Title>
              <Card.Text>Không tìm thấy học sinh nào phù hợp với tiêu chí tìm kiếm</Card.Text>
              <Button variant="outline-primary" onClick={handleResetFilters}>
                <i className="fas fa-redo me-2"></i>Xóa bộ lọc
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>STT</th>
                    <th>ID Hồ sơ y tế</th>
                    <th>Họ và tên</th>
                    <th>Mã học sinh</th>
                    <th>Lớp</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, index) => (
                    <tr key={student.id} style={{ cursor: 'pointer' }} onClick={() => handleViewStudent(student)}>
                      <td>{indexOfFirstStudent + index + 1}</td>
                      <td>
                        {student.healthProfileId ? (
                          <Badge bg="info" pill>{student.healthProfileId}</Badge>
                        ) : (
                          <Badge bg="secondary" pill>N/A</Badge>
                        )}
                      </td>
                      <td className="fw-bold">{student.fullName || student.name}</td>
                      <td>{student.studentId}</td>
                      <td>
                        <Badge bg="light" text="dark">{student.className || student.class}</Badge>
                      </td>
                      <td>{student.gender}</td>
                      <td>{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </div>
    );
  };

  // Simple pagination with "1 / 3" style
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-between align-items-center mt-4 px-3">
        {/* Showing entries info */}
        <div className="text-muted">
          <small>
            Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, gradeFilteredStudents.length)} of {gradeFilteredStudents.length} students
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

  // Check if any filters are active
  const hasActiveFilters = () => {
    return keyword.trim() !== "" || selectedClass.trim() !== "" || selectedGrade.trim() !== "";
  };

  // Hiển thị danh sách học sinh
  return (
    <Container fluid className="py-4">
      {/* Enhanced Filter Section - Styled like MedicineReceipts */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'}}>
              <h5 className="mb-0" style={{color: 'white'}}>
                <i className="fas fa-filter me-2"></i>
                Quản lý danh sách học sinh
              </h5>
            </div>
            <div className="card-body">
              <Form onSubmit={handleSearchSubmit}>
                <div className="row g-3 align-items-end">
                  {/* Search by Name/ID */}
                  <div className="col-md-4">
                    <label htmlFor="searchKeyword" className="form-label fw-bold">
                      <i className="fas fa-search me-1"></i>
                      Tìm kiếm
                    </label>
                    <Form.Control
                      id="searchKeyword"
                      type="text"
                      name="keyword"
                      className="form-control form-control-lg"
                      placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
                      value={keyword}
                      onChange={handleSearchInputChange}
                    />
                  </div>

                  {/* Grade Filter */}
                  <div className="col-md-3">
                    <label htmlFor="gradeFilter" className="form-label fw-bold">
                      <i className="fas fa-layer-group me-1"></i>
                      Khối
                    </label>
                    <Form.Control
                      id="gradeFilter"
                      type="number"
                      name="grade"
                      className="form-control form-control-lg"
                      placeholder="Nhập khối (vd: 10, 11, 12...)"
                      value={selectedGrade}
                      onChange={handleSearchInputChange}
                      min="1"
                      max="12"
                    />
                  </div>

                  {/* Class Filter */}
                  <div className={hasActiveFilters() ? "col-md-3" : "col-md-5"}>
                    <label htmlFor="classFilter" className="form-label fw-bold">
                      <i className="fas fa-users me-1"></i>
                      Lớp
                    </label>
                    <Form.Control
                      id="classFilter"
                      type="text"
                      name="class"
                      className="form-control form-control-lg"
                      placeholder="Nhập tên lớp (vd: 12A1, 11B2...)"
                      value={selectedClass}
                      onChange={handleSearchInputChange}
                    />
                  </div>

                  {/* Reset Button - Only show when filters are active */}
                  {hasActiveFilters() && (
                    <div className="col-md-2">
                      <Button
                        variant="outline-secondary"
                        className="btn btn-outline-secondary btn-lg w-100"
                        onClick={handleResetFilters}
                        title="Xóa bộ lọc"
                      >
                        <i className="fas fa-redo me-2"></i>
                        Đặt lại
                      </Button>
                    </div>
                  )}
                </div>

                {/* Filter Summary */}
                {hasActiveFilters() && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="alert alert-info mb-0">
                        <i className="fas fa-info-circle me-2"></i>
                        Tìm thấy <strong>{gradeFilteredStudents.length}</strong> học sinh
                        {keyword.trim() !== "" && (
                          <span> có tên/mã chứa "<strong>{keyword}</strong>"</span>
                        )}
                        {selectedGrade && (
                          <span> thuộc khối <strong>{selectedGrade}</strong></span>
                        )}
                        {selectedClass.trim() !== "" && (
                          <span> thuộc lớp "<strong>{selectedClass}</strong>"</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Form>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">
          Danh sách học sinh 
          <Badge bg="primary" className="ms-2">
            {gradeFilteredStudents.length}
          </Badge>
          {selectedGrade && (
            <Badge bg="success" className="ms-2">
              Khối {selectedGrade}
            </Badge>
          )}
        </h4>
        <div className="text-muted">
          Trang {currentPage} / {totalPages}
        </div>
      </div>
      
      {renderStudentTable()}
      
      {renderPagination()}
    </Container>
  );
};

export default StudentList;
