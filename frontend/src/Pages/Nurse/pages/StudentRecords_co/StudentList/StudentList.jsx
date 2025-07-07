import React, { useState, useEffect } from 'react';
import { useStudentRecords } from '../../../../../context/NurseContext/StudentRecordsContext';
import './StudentList.css';
import StudentDetail from '../StudentDetail/StudentDetail';
import AddEditRecord from '../AddEditRecord/AddEditRecord';
import { Form, Container, Row, Col, Card, Table, Button, InputGroup, Badge, Spinner, Alert } from 'react-bootstrap';

const StudentList = () => {
  // Sử dụng context thay vì local state và API calls
  const {
    filteredStudents,
    loading,
    error,
    classes,
    bloodTypes,
    searchCriteria,
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
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedHealthIssue, setSelectedHealthIssue] = useState('');
  
  // Đồng bộ state tìm kiếm local với context khi component mount
  useEffect(() => {
    setKeyword(searchCriteria.keyword);
    setSelectedClass(searchCriteria.class);
    setSelectedBloodType(searchCriteria.bloodType);
    setSelectedHealthIssue(searchCriteria.healthIssue);
  }, [searchCriteria]);

  // Thêm hàm xử lý cho Form.Control
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'keyword':
        setKeyword(value);
        break;
      case 'class':
        setSelectedClass(value);
        break;
      case 'bloodType':
        setSelectedBloodType(value);
        break;
      case 'healthIssue':
        setSelectedHealthIssue(value);
        break;
      default:
        break;
    }
  };

  // Xử lý khi nhấn nút tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch({
      keyword,
      class: selectedClass,
      bloodType: selectedBloodType,
      healthIssue: selectedHealthIssue
    });
  };
  
  // Xử lý khi nhấn nút Reset
  const handleResetFilters = () => {
    setKeyword('');
    setSelectedClass('');
    setSelectedBloodType('');
    setSelectedHealthIssue('');
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

  // Xử lý khi muốn thêm hồ sơ mới
  const handleAddRecord = () => {
    setViewMode('add');
    setSelectedStudentLocal(null);
    setSelectedStudent(null);
  };

  // Xử lý khi muốn chỉnh sửa hồ sơ
  const handleEditRecord = (student) => {
    setSelectedStudentLocal(student);
    setSelectedStudent(student);
    setViewMode('edit');
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
        onEdit={() => handleEditRecord(selectedStudentLocal)}
      />
    );
  }

  // Hiển thị form thêm/sửa hồ sơ
  if ((viewMode === 'add' || viewMode === 'edit') && (viewMode === 'add' || selectedStudentLocal)) {
    return (
      <AddEditRecord
        student={viewMode === 'edit' ? selectedStudentLocal : null}
        onBack={handleBackToList}
        mode={viewMode}
      />
    );
  }

  // Hàm render bảng học sinh
  const renderStudentTable = () => {
    return (
      <div className="table-responsive">
        {filteredStudents.length === 0 ? (
          <Card className="text-center p-5 my-4">
            <Card.Body>
              <i className="fas fa-search fa-3x mb-3 text-muted"></i>
              <Card.Title>Không tìm thấy kết quả</Card.Title>
              <Card.Text>Không tìm thấy học sinh nào phù hợp với tiêu chí tìm kiếm</Card.Text>
              <Button variant="outline-primary" onClick={resetFilters}>
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
                    <th>ID Hồ sơ y tế</th>
                    <th>Họ và tên</th>
                    <th>Mã học sinh</th>
                    <th>Lớp</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} style={{ cursor: 'pointer' }} onClick={() => handleViewStudent(student)}>
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
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewStudent(student);
                            }}
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRecord(student);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      </td>
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

  // Hiển thị danh sách học sinh
  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleSearchSubmit}>
            <Row className="mb-3">
              <Col md={6} lg={8}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    name="keyword"
                    placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
                    value={keyword}
                    onChange={handleSearchInputChange}
                  />
                  <Button variant="primary" type="submit">
                    <i className="fas fa-search me-1"></i> Tìm kiếm
                  </Button>
                </InputGroup>
              </Col>
              <Col md={6} lg={4} className="d-flex justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleResetFilters}
                  className="w-100"
                >
                  <i className="fas fa-redo me-1"></i> Đặt lại bộ lọc
                </Button>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-chalkboard me-1"></i> Lớp
                  </Form.Label>
                  <Form.Select
                    name="class"
                    value={selectedClass}
                    onChange={handleSearchInputChange}
                  >
                    <option value="">Tất cả các lớp</option>
                    {Array.isArray(classes) && classes.map((classItem, index) => {
                      const classKey = typeof classItem === 'string' ? classItem : (classItem?.id || index);
                      const classValue = typeof classItem === 'string' ? classItem : (classItem?.className || classItem?.name || '');
                      
                      return (
                        <option key={classKey} value={classValue}>
                          {classValue}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-tint me-1"></i> Nhóm máu
                  </Form.Label>
                  <Form.Select
                    name="bloodType"
                    value={selectedBloodType}
                    onChange={handleSearchInputChange}
                  >
                    <option value="">Tất cả</option>
                    {bloodTypes.map((type, index) => (
                      <option key={type || index} value={type || ''}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-heartbeat me-1"></i> Vấn đề sức khỏe
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="healthIssue"
                    placeholder="Dị ứng, bệnh mãn tính..."
                    value={selectedHealthIssue}
                    onChange={handleSearchInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">
          Danh sách học sinh 
          <Badge bg="primary" className="ms-2">
            {filteredStudents.length}
          </Badge>
        </h4>
        <Button 
          variant="success" 
          onClick={handleAddRecord}
        >
          <i className="fas fa-plus me-1"></i> Thêm hồ sơ mới
        </Button>
      </div>
      
      {renderStudentTable()}
    </Container>
  );
};

export default StudentList;
