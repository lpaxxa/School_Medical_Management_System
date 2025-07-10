import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Card, Badge, Modal, Row, Col, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import './VaccinationRecordManagement.css';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';

const VaccinationRecordManagement = ({ refreshData }) => {
  // Sử dụng context thay vì state local
  const {
    notifications,
    vaccines,
    loading,
    error,
    success,
    fetchNotificationsByType,
    fetchVaccines,
    addVaccinationRecord,
    clearError,
    clearSuccess
  } = useVaccination();

  // State local cho UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showAddVaccinationModal, setShowAddVaccinationModal] = useState(false);
  const [vaccinationForm, setVaccinationForm] = useState({
    studentId: '',
    studentName: '',
    vaccineName: '',
    dose: 1,
    vaccinationDate: new Date().toISOString().split('T')[0],
    nextDoseDate: '',
    notes: ''
  });
  const [localMessage, setLocalMessage] = useState({ type: '', text: '' });
  
  // Fetch thông báo từ API khi component mount
  useEffect(() => {
    fetchNotificationsByType('VACCINATION');
    fetchVaccines();
  }, [fetchNotificationsByType, fetchVaccines]);

  // Hiển thị thông báo từ context
  useEffect(() => {
    if (error) {
      setLocalMessage({ type: 'danger', text: error });
      setTimeout(() => {
        clearError();
        setLocalMessage({ type: '', text: '' });
      }, 5000);
    }
    
    if (success) {
      setLocalMessage({ type: 'success', text: success });
      setTimeout(() => {
        clearSuccess();
        setLocalMessage({ type: '', text: '' });
      }, 5000);
    }
  }, [error, success, clearError, clearSuccess]);
  
  // Lọc thông báo theo từ khóa tìm kiếm và trạng thái
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipients?.some(r => 
        r.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    if (!statusFilter) return matchesSearch;
    
    return matchesSearch && notification.recipients?.some(r => r.response === statusFilter);
  });

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Hiển thị badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge bg="success">Đã đồng ý</Badge>;
      case 'REJECTED':
        return <Badge bg="danger">Từ chối</Badge>;
      case 'PENDING':
        return <Badge bg="warning" text="dark">Chờ phản hồi</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  // Mở modal xem chi tiết
  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  // Mở modal thêm mũi tiêm
  const handleAddVaccination = (notification, recipient) => {
    setSelectedRecipient(recipient);
    setVaccinationForm({
      studentId: recipient.studentId,
      studentName: recipient.studentName,
      receiverName: recipient.receiverName,
      vaccineName: '',
      dose: 1,
      vaccinationDate: new Date().toISOString().split('T')[0],
      nextDoseDate: '',
      notes: `Dựa trên thông báo: ${notification.title}`
    });
    setShowAddVaccinationModal(true);
  };

  // Xử lý thay đổi form thêm mũi tiêm
  const handleVaccinationFormChange = (e) => {
    const { name, value } = e.target;
    setVaccinationForm({
      ...vaccinationForm,
      [name]: value
    });
    
    // Tự động tính ngày tiêm liều tiếp theo (6 tháng sau)
    if (name === 'vaccinationDate') {
      const nextDate = new Date(value);
      nextDate.setMonth(nextDate.getMonth() + 6);
      setVaccinationForm(prev => ({
        ...prev,
        nextDoseDate: nextDate.toISOString().split('T')[0]
      }));
    }
  };

  // Lưu thông tin mũi tiêm
  const handleSubmitVaccination = async (e) => {
    e.preventDefault();
    
    try {
      // Gọi phương thức từ context thay vì gọi API trực tiếp
      await addVaccinationRecord(vaccinationForm);
      
      // Đóng modal
      setShowAddVaccinationModal(false);
      
      // Làm mới dữ liệu nếu cần
      if (refreshData) refreshData();
      
    } catch (err) {
      console.error('Error adding vaccination record:', err);
    }
  };

  // Tính tổng số học sinh theo từng trạng thái
  const totalRecipients = notifications.flatMap(n => n.recipients || []).length;
  const acceptedCount = notifications.flatMap(n => n.recipients || []).filter(r => r.response === 'ACCEPTED').length;
  const rejectedCount = notifications.flatMap(n => n.recipients || []).filter(r => r.response === 'REJECTED').length;
  const pendingCount = notifications.flatMap(n => n.recipients || []).filter(r => r.response === 'PENDING').length;

  return (
    <div className="vaccination-record-management">
      <div className="section-header">
        <div className="header-title">
          <h2>Quản lý Tiêm chủng</h2>
          <p className="subtitle">Theo dõi phản hồi tiêm chủng từ phụ huynh</p>
        </div>
      </div>
      
      {localMessage.text && (
        <Alert variant={localMessage.type} dismissible onClose={() => setLocalMessage({ type: '', text: '' })}>
          {localMessage.text}
        </Alert>
      )}

      {/* Thống kê tổng quan */}
      <div className="records-summary">
        <div className="summary-card total">
          <div className="summary-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="summary-info">
            <p>Tổng số học sinh</p>
            <h3>{totalRecipients}</h3>
          </div>
        </div>
        
        <div className="summary-card completed">
          <div className="summary-icon">
            <i className="fas fa-check-circle"></i>
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
            <i className="fas fa-times-circle"></i>
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
            <i className="fas fa-clock"></i>
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

      {/* Phần tìm kiếm và lọc */}
      <div className="filters-section">
        <Row>
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, nội dung, tên phụ huynh hoặc học sinh..."
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
              <option value="ACCEPTED">Đã đồng ý</option>
              <option value="REJECTED">Từ chối</option>
              <option value="PENDING">Chờ phản hồi</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Danh sách thông báo */}
      {loading ? (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <Card key={notification.id} className="notification-card mb-3">
                <Card.Header>
                  <div className="notification-header">
                    <h5>{notification.title}</h5>
                    <div className="notification-meta">
                      <span><i className="fas fa-calendar-alt"></i> {formatDateTime(notification.createdAt)}</span>
                      <span><i className="fas fa-user-nurse"></i> {notification.senderName}</span>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="notification-message">
                    <p>{notification.message}</p>
                  </div>
                  
                  <div className="recipients-table-wrapper">
                    <Table responsive striped bordered hover>
                      <thead>
                        <tr>
                          <th>Phụ huynh</th>
                          <th>Học sinh</th>
                          <th>Mã học sinh</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notification.recipients?.map(recipient => (
                          <tr key={recipient.id}>
                            <td>{recipient.receiverName}</td>
                            <td>{recipient.studentName}</td>
                            <td>{recipient.studentId}</td>
                            <td>{getStatusBadge(recipient.response)}</td>
                            <td>
                              <Button 
                                variant="info" 
                                size="sm" 
                                className="me-1"
                                onClick={() => handleViewNotification(notification)}
                                title="Xem chi tiết"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              
                              {recipient.response === 'ACCEPTED' && (
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  onClick={() => handleAddVaccination(notification, recipient)}
                                  title="Thêm mũi tiêm"
                                >
                                  <i className="fas fa-syringe"></i>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <div className="no-results">
              <i className="fas fa-info-circle"></i>
              <p>Không tìm thấy thông báo tiêm chủng nào.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal xem chi tiết thông báo */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết thông báo tiêm chủng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <>
              <div className="notification-detail">
                <h5>{selectedNotification.title}</h5>
                <div className="notification-meta">
                  <p><strong>Người gửi:</strong> {selectedNotification.senderName}</p>
                  <p><strong>Thời gian:</strong> {formatDateTime(selectedNotification.createdAt)}</p>
                  <p><strong>Loại thông báo:</strong> Tiêm chủng</p>
                </div>
                <div className="notification-content">
                  <p><strong>Nội dung:</strong></p>
                  <div className="message-box">{selectedNotification.message}</div>
                </div>
              </div>
              
              <h6 className="mt-4">Danh sách phản hồi:</h6>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Phụ huynh</th>
                    <th>Học sinh</th>
                    <th>Mã học sinh</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNotification.recipients?.map(recipient => (
                    <tr key={recipient.id}>
                      <td>{recipient.receiverName}</td>
                      <td>{recipient.studentName}</td>
                      <td>{recipient.studentId}</td>
                      <td>{getStatusBadge(recipient.response)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal thêm mũi tiêm */}
      <Modal show={showAddVaccinationModal} onHide={() => setShowAddVaccinationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm mũi tiêm mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecipient && (
            <Form onSubmit={handleSubmitVaccination}>
              <Form.Group className="mb-3">
                <Form.Label>Học sinh</Form.Label>
                <Form.Control 
                  type="text" 
                  value={vaccinationForm.studentName} 
                  readOnly 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phụ huynh</Form.Label>
                <Form.Control 
                  type="text" 
                  value={vaccinationForm.receiverName} 
                  readOnly 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Vaccine <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  name="vaccineName"
                  value={vaccinationForm.vaccineName}
                  onChange={handleVaccinationFormChange}
                  required
                >
                  <option value="">-- Chọn vaccine --</option>
                  {vaccines.map(vaccine => (
                    <option key={vaccine.id} value={vaccine.name}>{vaccine.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mũi số <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="number" 
                      name="dose"
                      min="1"
                      value={vaccinationForm.dose}
                      onChange={handleVaccinationFormChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày tiêm <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="date" 
                      name="vaccinationDate"
                      value={vaccinationForm.vaccinationDate}
                      onChange={handleVaccinationFormChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Ngày tiêm tiếp theo</Form.Label>
                <Form.Control 
                  type="date" 
                  name="nextDoseDate"
                  value={vaccinationForm.nextDoseDate}
                  onChange={handleVaccinationFormChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  name="notes"
                  value={vaccinationForm.notes}
                  onChange={handleVaccinationFormChange}
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowAddVaccinationModal(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>Lưu mũi tiêm</>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VaccinationRecordManagement;