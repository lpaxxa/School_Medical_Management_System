import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Alert, Row, Col } from 'react-bootstrap';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { useStudentRecords } from '../../../../../context/NurseContext/StudentRecordsContext';
import './CreateCheckupList.css';

const CreateCheckupList = ({ refreshData }) => {
  // State cho thông tin đợt khám
  const [campaignInfo, setCampaignInfo] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'REGULAR', // Mặc định là khám định kỳ
  });
  
  // State cho danh sách học sinh đã chọn
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // State cho tìm kiếm và lọc học sinh
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  
  // State cho thông báo
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Lấy danh sách học sinh từ context
  const { students, classes } = useStudentRecords();
  
  // Lấy hàm tạo đợt khám từ context
  const { createCampaign } = useHealthCheckup();
  
  // Danh sách lớp học và khối lớp duy nhất
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [uniqueGrades, setUniqueGrades] = useState([]);
  
  // Tạo danh sách lớp và khối từ dữ liệu học sinh
  useEffect(() => {
    if (students && students.length > 0) {
      const classNames = [...new Set(students.map(student => student.className))].filter(Boolean);
      const grades = [...new Set(students.map(student => student.gradeLevel))].filter(Boolean);
      
      setUniqueClasses(classNames.sort());
      setUniqueGrades(grades.sort());
    }
  }, [students]);
  
  // Lọc học sinh theo điều kiện tìm kiếm
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === '' || student.className === classFilter;
    const matchesGrade = gradeFilter === '' || student.gradeLevel === gradeFilter;
    
    return matchesSearch && matchesClass && matchesGrade;
  });
  
  // Xử lý thay đổi thông tin đợt khám
  const handleCampaignInfoChange = (e) => {
    const { name, value } = e.target;
    setCampaignInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Xử lý chọn tất cả học sinh theo bộ lọc hiện tại
  const handleSelectAllFiltered = () => {
    // Kết hợp danh sách đã chọn với danh sách lọc mới
    const newSelectedStudents = [...selectedStudents];
    
    filteredStudents.forEach(student => {
      if (!newSelectedStudents.find(s => s.id === student.id)) {
        newSelectedStudents.push(student);
      }
    });
    
    setSelectedStudents(newSelectedStudents);
  };
  
  // Xử lý bỏ chọn tất cả học sinh
  const handleUnselectAll = () => {
    setSelectedStudents([]);
  };
  
  // Xử lý toggle chọn một học sinh
  const toggleStudentSelection = (student) => {
    const isSelected = selectedStudents.some(s => s.id === student.id);
    
    if (isSelected) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };
  
  // Xử lý tạo đợt khám mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!campaignInfo.name || !campaignInfo.startDate || !campaignInfo.endDate) {
      setMessage({
        type: 'danger',
        text: 'Vui lòng điền đầy đủ thông tin đợt khám'
      });
      return;
    }
    
    if (selectedStudents.length === 0) {
      setMessage({
        type: 'danger',
        text: 'Vui lòng chọn ít nhất một học sinh cho đợt khám'
      });
      return;
    }
    
    try {
      const newCampaign = {
        ...campaignInfo,
        students: selectedStudents.map(s => s.id),
        status: 'SCHEDULED'
      };
      
      await createCampaign(newCampaign);
      
      // Reset form sau khi tạo thành công
      setCampaignInfo({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'REGULAR'
      });
      setSelectedStudents([]);
      
      setMessage({
        type: 'success',
        text: 'Tạo đợt khám mới thành công!'
      });
      
      // Refresh dữ liệu ở component cha
      if (refreshData) refreshData();
      
    } catch (error) {
      setMessage({
        type: 'danger',
        text: `Lỗi khi tạo đợt khám: ${error.message}`
      });
      console.error('Error creating campaign:', error);
    }
  };
  
  return (
    <div className="create-checkup-list-container">
      <h2>Lập danh sách khám sức khỏe mới</h2>
      
      {message.text && (
        <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
          {message.text}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <h3>Thông tin đợt khám</h3>
            <Form.Group className="mb-3">
              <Form.Label>Tên đợt khám <span className="required">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={campaignInfo.name}
                onChange={handleCampaignInfoChange}
                placeholder="Nhập tên đợt khám (VD: Khám sức khỏe đầu năm 2025-2026)"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={campaignInfo.description}
                onChange={handleCampaignInfoChange}
                placeholder="Mô tả chi tiết về đợt khám"
                rows={3}
              />
            </Form.Group>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu <span className="required">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={campaignInfo.startDate}
                    onChange={handleCampaignInfoChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc <span className="required">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={campaignInfo.endDate}
                    onChange={handleCampaignInfoChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Loại đợt khám</Form.Label>
              <Form.Select
                name="type"
                value={campaignInfo.type}
                onChange={handleCampaignInfoChange}
              >
                <option value="REGULAR">Khám định kỳ</option>
                <option value="SPECIAL">Khám chuyên đề</option>
                <option value="EMERGENCY">Khám khẩn cấp</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <h3>Danh sách học sinh ({selectedStudents.length} đã chọn)</h3>
            
            <div className="filter-section mb-3">
              <Row>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm học sinh..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Select
                    value={classFilter}
                    onChange={e => setClassFilter(e.target.value)}
                  >
                    <option value="">Tất cả lớp</option>
                    {uniqueClasses.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col>
                  <Form.Select
                    value={gradeFilter}
                    onChange={e => setGradeFilter(e.target.value)}
                  >
                    <option value="">Tất cả khối</option>
                    {uniqueGrades.map(grade => (
                      <option key={grade} value={grade}>Khối {grade}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </div>
            
            <div className="selection-actions mb-3">
              <Button variant="outline-primary" onClick={handleSelectAllFiltered} className="me-2">
                <i className="fas fa-check-square"></i> Chọn tất cả
              </Button>
              <Button variant="outline-secondary" onClick={handleUnselectAll}>
                <i className="fas fa-square"></i> Bỏ chọn tất cả
              </Button>
              
              {selectedStudents.length > 0 && (
                <div className="selected-count mt-2">
                  Đã chọn: <strong>{selectedStudents.length}</strong> học sinh
                </div>
              )}
            </div>
            
            <div className="student-list">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th style={{width: '50px'}}></th>
                    <th>Mã HS</th>
                    <th>Họ và tên</th>
                    <th>Lớp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <tr 
                        key={student.id}
                        onClick={() => toggleStudentSelection(student)}
                        className={selectedStudents.some(s => s.id === student.id) ? 'selected-row' : ''}
                      >
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedStudents.some(s => s.id === student.id)}
                            onChange={() => {}} // Xử lý bởi onClick trên tr
                            onClick={e => e.stopPropagation()}
                          />
                        </td>
                        <td>{student.studentId}</td>
                        <td>{student.fullName}</td>
                        <td>{student.className}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">Không tìm thấy học sinh phù hợp</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
        
        <div className="form-actions mt-4">
          <Button type="submit" variant="primary" size="lg">
            <i className="fas fa-save"></i> Lưu danh sách khám
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateCheckupList;