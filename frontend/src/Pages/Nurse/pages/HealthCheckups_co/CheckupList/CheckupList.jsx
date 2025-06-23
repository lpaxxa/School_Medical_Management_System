import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { useAuth } from '../../../../../context/AuthContext';
import { FaCalendarPlus, FaFilter, FaEye, FaTrash, FaEdit, FaEnvelope, 
  FaCheck, FaTimes, FaClock, FaSearch, FaBell, FaCalendarCheck } from 'react-icons/fa';
import './CheckupList.css';
import * as studentService from '../../../../../services/studentService';

const CheckupList = () => {
  // Context and auth
  const { currentUser } = useAuth();
  const { 
    loading,
    error,
    fetchHealthCheckupNotifications,
    createNotification,
  } = useHealthCheckup();

  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // State for form data
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    recipients: []
  });
  
  // State for student selection
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load notifications when component mounts
  useEffect(() => {
    loadNotifications();
    loadStudents();
  }, []);
  
  // Function to load notifications
  const loadNotifications = async () => {
    try {
      setLocalLoading(true);
      const data = await fetchHealthCheckupNotifications();
      setNotifications(data || []);
    } catch (err) {
      setLocalError('Không thể tải thông báo. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Function to load students
  const loadStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };
  
  // Handle notification details
  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
  };
  
  // Handle delete notification
  const handleDeleteNotification = (notification) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };
  
  // Confirm delete notification
  const confirmDeleteNotification = async () => {
    try {
      setLocalLoading(true);
      // API call to delete notification would go here
      // await deleteNotification(selectedNotification.id);
      
      // For now, just filter it out locally
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      setShowDeleteModal(false);
    } catch (err) {
      setLocalError('Không thể xóa thông báo. Vui lòng thử lại sau.');
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNotificationForm({
      ...notificationForm,
      [name]: value
    });
  };
  
  // Handle student selection in form
  const handleStudentSelection = (studentId) => {
    const isSelected = selectedStudents.includes(studentId);
    
    if (isSelected) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };
  
  // Handle filter students by search term
  const filteredStudents = students.filter(student => 
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id?.toString().includes(searchTerm)
  );
  
  // Submit notification form
  const handleSubmitNotification = async (e) => {
    e.preventDefault();
    
    if (!notificationForm.title || !notificationForm.message || selectedStudents.length === 0) {
      setLocalError('Vui lòng điền đầy đủ thông tin và chọn ít nhất một học sinh');
      return;
    }
    
    try {
      setLocalLoading(true);
      
      // Prepare the recipients data
      const recipientsData = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return {
          studentId: studentId,
          studentName: student?.fullName
        };
      });
      
      // Prepare notification data
      const notificationData = {
        title: notificationForm.title,
        message: notificationForm.message,
        type: 'HEALTH_CHECKUP',
        senderId: currentUser?.id,
        senderName: currentUser?.fullName,
        recipients: recipientsData
      };
      
      // Call the API to create notification
      const result = await createNotification(notificationData);
      
      // Update the UI
      setNotifications([...notifications, result]);
      
      // Reset form
      setNotificationForm({
        title: '',
        message: '',
        recipients: []
      });
      setSelectedStudents([]);
      setShowCreateModal(false);
      
      // Reload notifications to get fresh data
      loadNotifications();
      
    } catch (err) {
      setLocalError('Không thể tạo thông báo. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };
  
  // Helper to render status badge
  const renderResponseBadge = (response) => {
    switch(response) {
      case 'ACCEPTED':
        return <Badge bg="success"><FaCheck /> Đồng ý</Badge>;
      case 'REJECTED':
        return <Badge bg="danger"><FaTimes /> Từ chối</Badge>;
      case 'PENDING':
      default:
        return <Badge bg="warning"><FaClock /> Chờ phản hồi</Badge>;
    }
  };

  return (
    <div className="checkup-list-container">
      {/* Loading overlay */}
      {(loading || localLoading) && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Error messages */}
      {(error || localError) && (
        <Alert variant="danger" onClose={() => setLocalError(null)} dismissible>
          {error || localError}
        </Alert>
      )}
      
      {/* Header with actions */}
      <div className="page-header">
        <h2><FaBell className="mr-2" /> Quản lý thông báo khám sức khỏe</h2>
        <div className="header-actions">
          <Button 
            variant="primary" 
            className="action-button"
            onClick={() => setShowCreateModal(true)}
          >
            <FaCalendarPlus /> Tạo thông báo khám
          </Button>
        </div>
      </div>
      
      {/* Notification cards */}
      <div className="notification-list">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card key={notification.id} className="notification-card">
              <Card.Body>
                <div className="notification-header">
                  <div className="notification-title">
                    <FaCalendarCheck className="notification-icon" />
                    <h5>{notification.title}</h5>
                  </div>
                  <div className="notification-date">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
                
                <Card.Text className="notification-message">
                  {notification.message}
                </Card.Text>
                
                <div className="notification-meta">
                  <div className="notification-sender">
                    <strong>Người gửi:</strong> {notification.senderName}
                  </div>
                  <div className="notification-recipients">
                    <strong>Số người nhận:</strong> {notification.recipients?.length || 0}
                  </div>
                </div>
                
                <div className="notification-actions">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleViewDetails(notification)}
                  >
                    <FaEye /> Chi tiết
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteNotification(notification)}
                  >
                    <FaTrash /> Xóa
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        ) : (
          <div className="no-data">
            <p>Chưa có thông báo khám sức khỏe nào được tạo.</p>
          </div>
        )}
      </div>
      
      {/* Create Notification Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tạo thông báo khám sức khỏe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitNotification}>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề thông báo</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={notificationForm.title}
                onChange={handleFormChange}
                placeholder="Nhập tiêu đề thông báo"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nội dung thông báo</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4}
                name="message"
                value={notificationForm.message}
                onChange={handleFormChange}
                placeholder="Nhập nội dung chi tiết thông báo khám sức khỏe"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Chọn học sinh nhận thông báo</Form.Label>
              <div className="search-container mb-2">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm học sinh theo tên hoặc ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              
              <div className="student-selection-container">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th style={{width: '50px'}}>Chọn</th>
                      <th>ID</th>
                      <th>Họ tên</th>
                      <th>Lớp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <tr key={student.id}>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentSelection(student.id)}
                            />
                          </td>
                          <td>{student.id}</td>
                          <td>{student.fullName}</td>
                          <td>{student.className || 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          Không tìm thấy học sinh phù hợp
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              
              <div className="selected-count">
                Đã chọn: {selectedStudents.length} học sinh
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmitNotification} disabled={localLoading}>
            {localLoading ? 'Đang xử lý...' : 'Gửi thông báo'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <>
              <div className="notification-detail-header">
                <h4>{selectedNotification.title}</h4>
                <p className="notification-timestamp">
                  Gửi lúc: {formatDate(selectedNotification.createdAt)}
                </p>
              </div>
              
              <div className="notification-detail-content">
                <p><strong>Người gửi:</strong> {selectedNotification.senderName}</p>
                <div className="notification-message-box">
                  <p>{selectedNotification.message}</p>
                </div>
              </div>
              
              <div className="notification-recipients-section">
                <h5>Danh sách người nhận ({selectedNotification.recipients?.length || 0})</h5>
                <Table striped bordered responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Phụ huynh</th>
                      <th>Học sinh</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNotification.recipients?.length > 0 ? (
                      selectedNotification.recipients.map(recipient => (
                        <tr key={recipient.id}>
                          <td>{recipient.id}</td>
                          <td>{recipient.receiverName}</td>
                          <td>{recipient.studentName} ({recipient.studentId})</td>
                          <td>{renderResponseBadge(recipient.response)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          Không có dữ liệu người nhận
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa thông báo "{selectedNotification?.title}"?</p>
          <p>Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDeleteNotification}
            disabled={localLoading}
          >
            {localLoading ? 'Đang xử lý...' : 'Xác nhận xóa'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckupList;
