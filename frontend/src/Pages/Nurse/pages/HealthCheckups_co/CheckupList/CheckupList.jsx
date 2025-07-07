import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { useAuth } from '../../../../../context/AuthContext';
import { FaCalendarPlus, FaFilter, FaEye, FaTrash, FaEdit, FaEnvelope, 
  FaCheck, FaTimes, FaClock, FaSearch, FaBell, FaCalendarCheck, FaUserMd,
  FaUserGraduate, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './CheckupList.css';

const CheckupList = () => {
  // Context and auth
  const { currentUser } = useAuth();
  const { 
    loading,
    error,
    fetchHealthCheckupNotifications,
    getStudentById
  } = useHealthCheckup();

  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  // State for modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHealthProfileModal, setShowHealthProfileModal] = useState(false);
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // State for health profile
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [healthProfileForm, setHealthProfileForm] = useState({
    studentId: '',
    studentName: '',
    checkupDate: '', 
    checkupType: '',
    height: '',
    weight: '',
    bmi: '',
    bloodPressure: '',
    visionLeft: '',
    visionRight: '',
    hearingStatus: '',
    heartRate: '',
    bodyTemperature: '',
    diagnosis: '',
    recommendations: '',
    followUpNeeded: false,
    parentNotified: false,
    medicalStaffId: '',
    medicalStaffName: ''
  });
  
  // Load notifications when component mounts
  useEffect(() => {
    loadNotifications();
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
  
  // Tính tổng số học sinh theo từng trạng thái
  const allRecipients = notifications.flatMap(n => n.recipients || []);
  const totalRecipients = allRecipients.length;
  const acceptedCount = allRecipients.filter(r => r.response === 'ACCEPTED').length;
  const rejectedCount = allRecipients.filter(r => r.response === 'REJECTED').length;
  const pendingCount = allRecipients.filter(r => r.response === 'PENDING' || !r.response).length;
  
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

  // Handle create health profile
  const handleCreateHealthProfile = async (recipient) => {
    try {
      setLocalLoading(true);
      setSelectedRecipient(recipient);
      
      // Gọi API để lấy thông tin chi tiết học sinh
      console.log('=== FETCHING STUDENT DETAILS ===');
      console.log('Recipient data:', recipient);
      
      // Sử dụng studentId từ recipient (mã học sinh như HS001) để gọi API
      const studentIdToCall = recipient.studentId; // Đây là mã học sinh (HS001, HS002...)
      console.log('Calling API with studentId:', studentIdToCall);
      
      const studentData = await getStudentById(studentIdToCall);
      console.log('Student details from API:', studentData);
      
      setStudentDetails(studentData);
      setHealthProfileForm({
        ...healthProfileForm,
        studentId: studentData.id, // Sử dụng ID số từ API (1, 2, 3...)
        // studentCode: studentData.studentId, // Mã học sinh để hiển thị (HS001, HS002...)
        studentName: studentData.fullName, // Tên đầy đủ từ API
        medicalStaffId: currentUser?.id || '',
        medicalStaffName: currentUser?.fullName || '',
        checkupDate: new Date().toISOString().split('T')[0], // Today's date
        checkupType: selectedNotification?.title || '', // Sử dụng tiêu đề thông báo làm loại khám
        parentNotified: true
      });
      setShowHealthProfileModal(true);
    } catch (err) {
      setLocalError('Không thể lấy thông tin học sinh. Vui lòng thử lại sau.');
      console.error('Error fetching student data:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Handle health profile form change
  const handleHealthProfileFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHealthProfileForm({
      ...healthProfileForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Calculate BMI automatically
  useEffect(() => {
    if (healthProfileForm.height && healthProfileForm.weight) {
      const heightInM = parseFloat(healthProfileForm.height) / 100;
      const weight = parseFloat(healthProfileForm.weight);
      const bmi = (weight / (heightInM * heightInM)).toFixed(1);
      setHealthProfileForm(prev => ({
        ...prev,
        bmi: bmi
      }));
    }
  }, [healthProfileForm.height, healthProfileForm.weight]);

  // Submit health profile
  const handleSubmitHealthProfile = async (e) => {
    e.preventDefault();
    
    try {
      setLocalLoading(true);
      
      // Validate required fields
      if (!healthProfileForm.studentId || !healthProfileForm.checkupDate || 
          !healthProfileForm.checkupType || !healthProfileForm.height || 
          !healthProfileForm.weight || !healthProfileForm.medicalStaffId) {
        setLocalError('Vui lòng điền đầy đủ các trường bắt buộc.');
        return;
      }
      
      // Prepare data for API - đảm bảo tất cả trường bắt buộc có giá trị
      const profileData = {
        studentId: studentDetails.id, // Sử dụng ID số từ studentDetails (1, 2, 3...)
        checkupDate: healthProfileForm.checkupDate,
        checkupType: healthProfileForm.checkupType,
        height: parseFloat(healthProfileForm.height),
        weight: parseFloat(healthProfileForm.weight),
        bmi: healthProfileForm.bmi ? parseFloat(healthProfileForm.bmi) : 0,
        bloodPressure: healthProfileForm.bloodPressure || '',
        visionLeft: healthProfileForm.visionLeft || '',
        visionRight: healthProfileForm.visionRight || '',
        hearingStatus: healthProfileForm.hearingStatus || '',
        heartRate: healthProfileForm.heartRate ? parseInt(healthProfileForm.heartRate) : 0,
        bodyTemperature: healthProfileForm.bodyTemperature ? parseFloat(healthProfileForm.bodyTemperature) : 0,
        diagnosis: healthProfileForm.diagnosis || '',
        recommendations: healthProfileForm.recommendations || '',
        followUpNeeded: healthProfileForm.followUpNeeded,
        parentNotified: healthProfileForm.parentNotified,
        medicalStaffId: parseInt(healthProfileForm.medicalStaffId),
        medicalStaffName: healthProfileForm.medicalStaffName || ''
      };

      // Log detailed information
      console.log('=== HEALTH PROFILE SUBMISSION ===');
      console.log('Form Data:', healthProfileForm);
      console.log('Selected Recipient:', selectedRecipient);
      console.log('Data being sent to server:', {
        url: 'http://localhost:8080/api/v1/medical-checkups',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: profileData
      });

      // Call API to create health profile
      const response = await fetch('http://localhost:8080/api/v1/medical-checkups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('=== API ERROR RESPONSE ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Error Details:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('=== API SUCCESS RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', result);
      
      // Reset form and close modal
      setHealthProfileForm({
        studentId: '',
        studentCode: '',
        studentName: '',
        checkupDate: '',
        checkupType: '',
        height: '',
        weight: '',
        bmi: '',
        bloodPressure: '',
        visionLeft: '',
        visionRight: '',
        hearingStatus: '',
        heartRate: '',
        bodyTemperature: '',
        diagnosis: '',
        recommendations: '',
        followUpNeeded: false,
        parentNotified: false,
        medicalStaffId: '',
        medicalStaffName: ''
      });
      
      setStudentDetails(null);
      
      setShowHealthProfileModal(false);
      
      // Show success message
      setLocalError(null);
      alert('Tạo hồ sơ sức khỏe thành công!');
      
    } catch (err) {
      setLocalError('Không thể tạo hồ sơ sức khỏe. Vui lòng thử lại sau.');
      console.error('Error creating health profile:', err);
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
        return <Badge bg="success"><FaCheck /> Đã đồng ý</Badge>;
      case 'REJECTED':
        return <Badge bg="danger"><FaTimes /> Từ chối</Badge>;
      case 'PENDING':
      default:
        return <Badge bg="warning"><FaClock /> Chờ phản hồi</Badge>;
    }
  };

  // Filter notifications by search term and only include those with recipients
  const filteredNotifications = notifications.filter(notification =>
    notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (notification.recipients?.length > 0) // Only include notifications with at least one recipient
  );

  // Filter recipients by status in details modal
  const getFilteredRecipients = (recipients) => {
    if (!statusFilter) return recipients;
    return recipients.filter(recipient => {
      switch(statusFilter) {
        case 'PENDING':
          return !recipient.response || recipient.response === 'PENDING';
        case 'ACCEPTED':
          return recipient.response === 'ACCEPTED';
        case 'REJECTED':
          return recipient.response === 'REJECTED';
        default:
          return true;
      }
    });
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
      
      {/* Header with search */}
      <div className="page-header">
        <h2><FaBell className="mr-2" /> Quản lý thông báo khám sức khỏe</h2>
          <div className="header-actions">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tiêu đề thông báo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Thống kê tổng quan */}
      <div className="records-summary">
        <div className="summary-card total">
          <div className="summary-icon">
            <FaUserGraduate />
          </div>
          <div className="summary-info">
            <p>Tổng số đơn</p>
            <h3>{totalRecipients}</h3>
          </div>
        </div>
        
        <div className="summary-card completed">
          <div className="summary-icon">
            <FaCheckCircle />
          </div>
          <div className="summary-info">
            <p>Đã đồng ý</p>
            <h3>{acceptedCount}</h3>
            <span className="percentage">
              {totalRecipients > 0 ? `(${Math.round((acceptedCount / totalRecipients) * 100)}%)` : '(0%)'}
            </span>
          </div>
        </div>
        
        <div className="summary-card rejected">
          <div className="summary-icon">
            <FaTimesCircle />
          </div>
          <div className="summary-info">
            <p>Đã từ chối</p>
            <h3>{rejectedCount}</h3>
            <span className="percentage">
              {totalRecipients > 0 ? `(${Math.round((rejectedCount / totalRecipients) * 100)}%)` : '(0%)'}
            </span>
          </div>
        </div>
        
        <div className="summary-card pending">
          <div className="summary-icon">
            <FaClock />
          </div>
          <div className="summary-info">
            <p>Chờ phản hồi</p>
            <h3>{pendingCount}</h3>
            <span className="percentage">
              {totalRecipients > 0 ? `(${Math.round((pendingCount / totalRecipients) * 100)}%)` : '(0%)'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Notification cards */}
      <div className="notification-list">
        {filteredNotifications && filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
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
                <div className="recipients-header">
                  <h5>Danh sách người nhận ({selectedNotification.recipients?.length || 0})</h5>
                  <div className="status-filter">
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      size="sm"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="PENDING">Chờ phản hồi</option>
                      <option value="ACCEPTED">Đã đồng ý</option>
                      <option value="REJECTED">Từ chối</option>
                    </Form.Select>
                  </div>
                </div>
                
                <Table striped bordered responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Phụ huynh</th>
                      <th>Học sinh</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNotification.recipients?.length > 0 ? (
                      getFilteredRecipients(selectedNotification.recipients).map(recipient => (
                        <tr key={recipient.id}>
                          <td>{recipient.id}</td>
                          <td>{recipient.receiverName}</td>
                          <td>{recipient.studentName} ({recipient.studentId})</td>
                          <td>{renderResponseBadge(recipient.response)}</td>
                          <td>
                            {recipient.response === 'ACCEPTED' && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleCreateHealthProfile(recipient)}
                              >
                                <FaUserMd /> Tạo hồ sơ sức khỏe
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
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

      {/* Health Profile Modal */}
      <Modal show={showHealthProfileModal} onHide={() => setShowHealthProfileModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tạo hồ sơ sức khỏe - {healthProfileForm.studentName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitHealthProfile}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã học sinh <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={healthProfileForm.studentCode}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên học sinh</Form.Label>
                  <Form.Control
                    type="text"
                    value={healthProfileForm.studentName}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày khám <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="checkupDate"
                    value={healthProfileForm.checkupDate}
                    onChange={handleHealthProfileFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Loại khám <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="checkupType"
                value={healthProfileForm.checkupType}
                onChange={handleHealthProfileFormChange}
                placeholder="Ví dụ: Khám sức khỏe định kỳ"
                required
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Chiều cao (cm) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="height"
                    value={healthProfileForm.height}
                    onChange={handleHealthProfileFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cân nặng (kg) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="weight"
                    value={healthProfileForm.weight}
                    onChange={handleHealthProfileFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>BMI</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="bmi"
                    value={healthProfileForm.bmi}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Huyết áp</Form.Label>
                  <Form.Control
                    type="text"
                    name="bloodPressure"
                    value={healthProfileForm.bloodPressure}
                    onChange={handleHealthProfileFormChange}
                    placeholder="Ví dụ: 110/70"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhịp tim</Form.Label>
                  <Form.Control
                    type="number"
                    name="heartRate"
                    value={healthProfileForm.heartRate}
                    onChange={handleHealthProfileFormChange}
                    placeholder="Nhịp/phút"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Thị lực mắt trái</Form.Label>
                  <Form.Control
                    type="text"
                    name="visionLeft"
                    value={healthProfileForm.visionLeft}
                    onChange={handleHealthProfileFormChange}
                    placeholder="Ví dụ: 6/6"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Thị lực mắt phải</Form.Label>
                  <Form.Control
                    type="text"
                    name="visionRight"
                    value={healthProfileForm.visionRight}
                    onChange={handleHealthProfileFormChange}
                    placeholder="Ví dụ: 6/9"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Thính lực</Form.Label>
                  <Form.Control
                    type="text"
                    name="hearingStatus"
                    value={healthProfileForm.hearingStatus}
                    onChange={handleHealthProfileFormChange}
                    placeholder="Ví dụ: Bình thường"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Nhiệt độ cơ thể (°C)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                name="bodyTemperature"
                value={healthProfileForm.bodyTemperature}
                onChange={handleHealthProfileFormChange}
                placeholder="Ví dụ: 36.7"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chẩn đoán</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="diagnosis"
                value={healthProfileForm.diagnosis}
                onChange={handleHealthProfileFormChange}
                placeholder="Nhập chẩn đoán..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Khuyến nghị</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="recommendations"
                value={healthProfileForm.recommendations}
                onChange={handleHealthProfileFormChange}
                placeholder="Nhập khuyến nghị..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="followUpNeeded"
                    checked={healthProfileForm.followUpNeeded}
                    onChange={handleHealthProfileFormChange}
                    label="Cần theo dõi thêm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="parentNotified"
                    checked={healthProfileForm.parentNotified}
                    onChange={handleHealthProfileFormChange}
                    label="Đã thông báo phụ huynh"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Tên nhân viên y tế</Form.Label>
              <Form.Control
                type="text"
                name="medicalStaffName"
                value={healthProfileForm.medicalStaffName}
                onChange={handleHealthProfileFormChange}
                placeholder="Nhập tên nhân viên y tế"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHealthProfileModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitHealthProfile}
            disabled={localLoading}
          >
            {localLoading ? 'Đang xử lý...' : 'Tạo hồ sơ'}
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
