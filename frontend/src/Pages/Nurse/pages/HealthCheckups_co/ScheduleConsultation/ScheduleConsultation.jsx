import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Table, Alert, Row, Col, Card, Modal } from 'react-bootstrap';
import { useStudentRecords } from '../../../../../context/NurseContext/StudentRecordsContext';
import { useAuth } from '../../../../../context/AuthContext';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import './ScheduleConsultation.css';

const ScheduleConsultation = ({ refreshData }) => {
  // State cho thông tin lịch hẹn
  const [consultationData, setConsultationData] = useState({
    studentId: '',
    studentName: '',
    date: '',
    time: '',
    duration: 30,
    reason: '',
    notes: '',
    location: 'Phòng y tế trường học'
  });
  
  // State cho danh sách lịch hẹn
  const [consultations, setConsultations] = useState([]);
  
  // State cho tìm kiếm học sinh
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showStudentResults, setShowStudentResults] = useState(false);
  
  // State cho thông báo
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State cho modal xác nhận
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  
  // Refs cho dropdown tìm kiếm
  const searchResultsRef = useRef(null);
  
  // Get data từ các context
  const { students } = useStudentRecords();
  const { currentUser } = useAuth();
  const { createConsultation, getConsultations, updateConsultationStatus } = useHealthCheckup();
  
  // Load danh sách lịch hẹn khi component mount
  useEffect(() => {
    fetchConsultations();
  }, []);
  
  // Fetch danh sách lịch hẹn từ API
  const fetchConsultations = async () => {
    try {
      const data = await getConsultations();
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setMessage({
        type: 'danger',
        text: 'Không thể tải danh sách lịch hẹn tư vấn'
      });
    }
  };
  
  // Xử lý click ra ngoài dropdown
  const handleClickOutside = (event) => {
    if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
      setShowStudentResults(false);
    }
  };
  
  // Thêm sự kiện click ra ngoài dropdown
  useEffect(() => {
    if (showStudentResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showStudentResults]);
  
  // Xử lý tìm kiếm học sinh
  const handleStudentSearch = (searchTerm) => {
    setStudentSearchTerm(searchTerm);
    
    if (searchTerm.trim() === '') {
      setFilteredStudents([]);
      setShowStudentResults(false);
      return;
    }
    
    const filtered = students.filter(student => 
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Giới hạn 10 kết quả
    
    setFilteredStudents(filtered);
    setShowStudentResults(filtered.length > 0);
  };
  
  // Xử lý chọn học sinh
  const handleSelectStudent = (student) => {
    setConsultationData(prev => ({
      ...prev,
      studentId: student.id,
      studentName: student.fullName
    }));
    setShowStudentResults(false);
  };
  
  // Xử lý thay đổi form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConsultationData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!consultationData.studentId || !consultationData.date || !consultationData.time) {
      setMessage({
        type: 'danger',
        text: 'Vui lòng điền đầy đủ thông tin học sinh, ngày và giờ hẹn'
      });
      return;
    }
    
    try {
      // Format datetime cho API
      const dateTime = `${consultationData.date}T${consultationData.time}:00`;
      
      const newConsultation = {
        studentId: consultationData.studentId,
        scheduledTime: dateTime,
        duration: consultationData.duration,
        reason: consultationData.reason,
        notes: consultationData.notes,
        location: consultationData.location,
        status: 'SCHEDULED',
        createdBy: currentUser?.id || 1
      };
      
      await createConsultation(newConsultation);
      
      // Reset form
      setConsultationData({
        studentId: '',
        studentName: '',
        date: '',
        time: '',
        duration: 30,
        reason: '',
        notes: '',
        location: 'Phòng y tế trường học'
      });
      
      setMessage({
        type: 'success',
        text: 'Đặt lịch tư vấn thành công!'
      });
      
      // Refresh danh sách
      fetchConsultations();
      
      // Thông báo cho component cha
      if (refreshData) refreshData();
      
    } catch (error) {
      setMessage({
        type: 'danger',
        text: `Lỗi khi đặt lịch: ${error.message}`
      });
      console.error('Error scheduling consultation:', error);
    }
  };
  
  // Xử lý xác nhận/hủy lịch hẹn
  const handleConfirmAction = async () => {
    if (!selectedConsultation) return;
    
    try {
      await updateConsultationStatus(
        selectedConsultation.id,
        selectedConsultation.action === 'complete' ? 'COMPLETED' : 'CANCELLED'
      );
      
      // Refresh danh sách
      fetchConsultations();
      
      setMessage({
        type: 'success',
        text: selectedConsultation.action === 'complete' 
          ? 'Đã xác nhận hoàn thành buổi tư vấn' 
          : 'Đã hủy lịch hẹn tư vấn'
      });
      
    } catch (error) {
      setMessage({
        type: 'danger',
        text: `Lỗi khi cập nhật trạng thái: ${error.message}`
      });
      console.error('Error updating consultation status:', error);
    } finally {
      setShowConfirmModal(false);
      setSelectedConsultation(null);
    }
  };
  
  // Xử lý hiển thị modal xác nhận
  const showConfirmationModal = (consultation, action) => {
    setSelectedConsultation({ ...consultation, action });
    setShowConfirmModal(true);
  };
  
  // Hàm định dạng ngày giờ
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Hàm lấy class theo trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'status-scheduled';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'NO_SHOW':
        return 'status-no-show';
      default:
        return '';
    }
  };
  
  // Hàm hiển thị text theo trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Đã lên lịch';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'NO_SHOW':
        return 'Vắng mặt';
      default:
        return 'Không xác định';
    }
  };
  
  return (
    <div className="schedule-consultation-container">
      <h2>Lập lịch tư vấn riêng</h2>
      
      {message.text && (
        <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
          {message.text}
        </Alert>
      )}
      
      <Row>
        <Col md={5}>
          <Card className="mb-4">
            <Card.Header as="h3">Đặt lịch hẹn mới</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3 student-search-container">
                  <Form.Label>Học sinh <span className="required">*</span></Form.Label>
                  <Form.Control 
                    type="text"
                    placeholder="Nhập tên học sinh để tìm kiếm..."
                    value={studentSearchTerm}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    onFocus={() => {
                      if (filteredStudents.length > 0) setShowStudentResults(true);
                    }}
                    required
                  />
                  
                  {showStudentResults && (
                    <div className="student-search-results" ref={searchResultsRef}>
                      {filteredStudents.map(student => (
                        <div 
                          key={student.id} 
                          className="student-search-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectStudent(student);
                          }}
                        >
                          <span className="student-id">{student.studentId}</span>
                          <span className="student-name">{student.fullName}</span>
                          <span className="student-class">{student.className || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {consultationData.studentId && (
                    <div className="selected-student-info">
                      Đã chọn: <strong>{consultationData.studentName}</strong>
                    </div>
                  )}
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày hẹn <span className="required">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={consultationData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giờ hẹn <span className="required">*</span></Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={consultationData.time}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Thời lượng (phút)</Form.Label>
                  <Form.Select
                    name="duration"
                    value={consultationData.duration}
                    onChange={handleInputChange}
                  >
                    <option value="15">15 phút</option>
                    <option value="30">30 phút</option>
                    <option value="45">45 phút</option>
                    <option value="60">60 phút</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Lý do tư vấn</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="reason"
                    value={consultationData.reason}
                    onChange={handleInputChange}
                    placeholder="Nhập lý do cần tư vấn"
                    rows={2}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Địa điểm</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={consultationData.location}
                    onChange={handleInputChange}
                    placeholder="Nhập địa điểm tư vấn"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    value={consultationData.notes}
                    onChange={handleInputChange}
                    placeholder="Thông tin bổ sung khác (nếu có)"
                    rows={2}
                  />
                </Form.Group>
                
                <Button type="submit" variant="primary">
                  <i className="fas fa-calendar-plus"></i> Đặt lịch hẹn
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={7}>
          <Card>
            <Card.Header as="h3">
              Danh sách lịch hẹn tư vấn
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="float-end"
                onClick={fetchConsultations}
              >
                <i className="fas fa-sync"></i> Làm mới
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="consultations-table-container">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Học sinh</th>
                      <th>Thời gian</th>
                      <th>Lý do</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.length > 0 ? (
                      consultations.map(consultation => (
                        <tr key={consultation.id}>
                          <td>{consultation.studentName}</td>
                          <td>{formatDateTime(consultation.scheduledTime)}</td>
                          <td>{consultation.reason || 'Không có'}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(consultation.status)}`}>
                              {getStatusText(consultation.status)}
                            </span>
                          </td>
                          <td>
                            <div className="consultation-actions">
                              {consultation.status === 'SCHEDULED' && (
                                <>
                                  <Button 
                                    variant="success" 
                                    size="sm" 
                                    title="Đánh dấu hoàn thành"
                                    onClick={() => showConfirmationModal(consultation, 'complete')}
                                  >
                                    <i className="fas fa-check"></i>
                                  </Button>
                                  <Button 
                                    variant="danger" 
                                    size="sm" 
                                    title="Hủy lịch hẹn"
                                    onClick={() => showConfirmationModal(consultation, 'cancel')}
                                  >
                                    <i className="fas fa-times"></i>
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="info" 
                                size="sm" 
                                title="Xem chi tiết"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Chưa có lịch hẹn tư vấn nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Modal xác nhận hành động */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedConsultation?.action === 'complete' ? 'Xác nhận hoàn thành' : 'Xác nhận hủy lịch'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConsultation?.action === 'complete' ? (
            <p>Bạn muốn xác nhận đã hoàn thành buổi tư vấn cho học sinh <strong>{selectedConsultation?.studentName}</strong>?</p>
          ) : (
            <p>Bạn chắc chắn muốn hủy lịch hẹn tư vấn với học sinh <strong>{selectedConsultation?.studentName}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Đóng
          </Button>
          <Button 
            variant={selectedConsultation?.action === 'complete' ? "success" : "danger"}
            onClick={handleConfirmAction}
          >
            {selectedConsultation?.action === 'complete' ? 'Xác nhận hoàn thành' : 'Xác nhận hủy'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScheduleConsultation;