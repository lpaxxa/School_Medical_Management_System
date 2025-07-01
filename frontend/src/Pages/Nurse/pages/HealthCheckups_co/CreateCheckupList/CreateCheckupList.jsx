import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Alert, Row, Col, Card, Tabs, Tab, Modal, Badge } from 'react-bootstrap';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { useAuth } from '../../../../../context/AuthContext';
import './CreateCheckupList.css';
import { FaEye, FaPaperPlane, FaUsers } from 'react-icons/fa';

const CreateCheckupList = ({ refreshData }) => {
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('plans');
  const { currentUser } = useAuth();
  
  // Sử dụng HealthCheckupContext
  const { 
    loading, 
    error, 
    getHealthCampaigns, 
    getParents, 
    sendNotification 
  } = useHealthCheckup();
  
  // State for search and filters
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [planSearchTerm, setPlanSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // State for modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPlan, setDetailPlan] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSendingToAll, setIsSendingToAll] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  
  // Ensure we have a valid senderId (must be a number, not null)
  const nurseId = currentUser?.id ? parseInt(currentUser.id) : 1;
  
  // State for notification data - Đảm bảo senderId là số nguyên ngay từ đầu
  const [notificationData, setNotificationData] = useState({
    title: 'Thông báo khám sức khỏe định kỳ',
    message: 'Trường tổ chức khám sức khỏe cho học sinh. Các phụ huynh vui lòng xác nhận đồng ý cho các phần khám đặc biệt.',
    type: 'HEALTH_CHECKUP',
    senderId: nurseId, // Ensure senderId is always a number
    receiverIds: []
  });

  // States for data
  const [campaigns, setCampaigns] = useState([]);
  const [parents, setParents] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [sentNotifications, setSentNotifications] = useState(new Set()); // Track sent notifications

  // Fetch campaigns and parents data sử dụng HealthCheckupContext
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLocalLoading(true);
        
        // Sử dụng functions từ HealthCheckupContext
        const [campaignsData, parentsData] = await Promise.all([
          getHealthCampaigns(),
          getParents()
        ]);
        
        setCampaigns(campaignsData);
        setParents(parentsData);
        
        setLocalLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({
          type: 'danger',
          text: 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
        });
        setLocalLoading(false);
      }
    };

    fetchData();
  }, [refreshData, getHealthCampaigns, getParents]);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.title?.toLowerCase().includes(planSearchTerm.toLowerCase()) ||
      campaign.notes?.toLowerCase().includes(planSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter parents
  const filteredParents = parents.filter(parent => 
    parent.fullName?.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    parent.email?.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    parent.phoneNumber?.includes(parentSearchTerm)
  );

  // Handle notification modal for single parent
  const handleOpenNotificationModal = (parent) => {
    console.log('Selected parent:', parent); // Debug log
    setSelectedParent(parent);
    setIsSendingToAll(false);
    setNotificationData({
      ...notificationData,
      senderId: nurseId, // Ensure senderId is set again
      receiverIds: [parseInt(parent.id)]
    });
    setShowNotificationModal(true);
  };

  // Handle notification modal for all filtered parents
  const handleOpenSendToAllModal = () => {
    if (filteredParents.length === 0) {
      setMessage({
        type: 'warning',
        text: 'Không có phụ huynh nào trong danh sách để gửi thông báo!'
      });
      return;
    }
    
    setIsSendingToAll(true);
    setNotificationData({
      ...notificationData,
      senderId: nurseId, // Ensure senderId is set again
      receiverIds: filteredParents.map(parent => parseInt(parent.id))
    });
    setShowNotificationModal(true);
  };

  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedParent(null);
    setIsSendingToAll(false);
  };

  // Handle notification input changes
  const handleNotificationInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationData({
      ...notificationData,
      [name]: value
    });
  };

  // Handle notification sending sử dụng HealthCheckupContext
  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendingNotification(true);

    try {
      if (!notificationData.title.trim() || !notificationData.message.trim()) {
        setMessage({
          type: 'danger',
          text: 'Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!'
        });
        setSendingNotification(false);
        return;
      }

      // Đảm bảo receiverIds là mảng các số nguyên
      const receiverIds = isSendingToAll 
        ? filteredParents.map(parent => parseInt(parent.id)) 
        : [parseInt(selectedParent.id)];
      
      // Đảm bảo senderId là số nguyên và không phải null
      const senderId = nurseId;
      
      const notificationPayload = {
        title: notificationData.title.trim(),
        message: notificationData.message.trim(),
        type: 'HEALTH_CHECKUP', // Luôn cố định là HEALTH_CHECKUP
        senderId: senderId,
        receiverIds: receiverIds
      };
      
      // Log để debug
      console.log('Sending notification with data:', JSON.stringify(notificationPayload, null, 2));
      
      // Kiểm tra token trước khi gửi
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }
      
      // Sử dụng sendNotification từ HealthCheckupContext
      const result = await sendNotification(notificationPayload);
      console.log('Notification result:', result);

      // Thêm parent IDs vào danh sách đã gửi
      const newSentNotifications = new Set(sentNotifications);
      receiverIds.forEach(id => newSentNotifications.add(id));
      setSentNotifications(newSentNotifications);

      setMessage({
        type: 'success',
        text: isSendingToAll 
          ? `Đã gửi thông báo khám sức khỏe thành công tới ${receiverIds.length} phụ huynh!`
          : `Đã gửi thông báo khám sức khỏe thành công tới ${selectedParent.fullName}!`
      });
      
      handleCloseNotificationModal();
    } catch (error) {
      console.error('Error sending notification:', error);
      let errorMessage = 'Không thể gửi thông báo. Vui lòng thử lại sau.';
      
      if (error.message) {
        if (error.message.includes('400')) {
          errorMessage = 'Lỗi dữ liệu: Định dạng thông báo không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Lỗi xác thực: Bạn không có quyền thực hiện thao tác này hoặc phiên đăng nhập đã hết hạn.';
        } else if (error.message.includes('null')) {
          errorMessage = 'Lỗi dữ liệu: ID không được để trống. Vui lòng đăng nhập lại.';
        } else {
          errorMessage = `Lỗi: ${error.message}`;
        }
      }
      
      setMessage({
        type: 'danger',
        text: errorMessage
      });
    } finally {
      setSendingNotification(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="create-checkup-list">
      <div className="section-header">
        <h2>Quản lý khám sức khỏe</h2>
      </div>
      
      {message.text && (
        <Alert 
          variant={message.type} 
          onClose={() => setMessage({ type: '', text: '' })} 
          dismissible
        >
          {message.text}
        </Alert>
      )}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        {/* Tab Danh mục định kì */}
        <Tab eventKey="plans" title="Danh mục định kì">
          <Card>
            <Card.Header as="h5">Danh mục khám sức khỏe định kì</Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc ghi chú..."
                    value={planSearchTerm}
                    onChange={(e) => setPlanSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PREPARING">Đang chuẩn bị</option>
                    <option value="IN_PROGRESS">Đang diễn ra</option>
                    <option value="COMPLETED">Hoàn thành</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên chiến dịch</th>
                      <th>Ngày bắt đầu</th>
                      <th>Ghi chú</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredCampaigns.length > 0 ? (
                      filteredCampaigns.map(campaign => (
                        <tr key={campaign.id}>
                          <td>{campaign.id}</td>
                          <td>{campaign.title}</td>
                          <td>{formatDate(campaign.startDate)}</td>
                          <td>{campaign.notes}</td>
                          <td>
                            <Badge bg={
                              campaign.status === 'PREPARING' ? 'warning' :
                              campaign.status === 'IN_PROGRESS' ? 'primary' :
                              'success'
                            }>
                              {campaign.status === 'PREPARING' ? 'Đang chuẩn bị' :
                               campaign.status === 'IN_PROGRESS' ? 'Đang diễn ra' :
                               'Hoàn thành'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Không tìm thấy chiến dịch khám sức khỏe nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        
        {/* Tab Danh sách phụ huynh */}
        <Tab eventKey="parents" title="Danh sách phụ huynh">
          <Card>
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              <span>Danh sách phụ huynh</span>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleOpenSendToAllModal}
                disabled={filteredParents.length === 0}
                className="send-all-btn"
              >
                <FaUsers className="me-2" /> Gửi thông báo cho tất cả
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                    value={parentSearchTerm}
                    onChange={(e) => setParentSearchTerm(e.target.value)}
                  />
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Họ và tên</th>
                      <th>Số điện thoại</th>
                      <th>Email</th>
                      <th>Địa chỉ</th>
                      <th>Quan hệ</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredParents.length > 0 ? (
                      filteredParents.map(parent => (
                        <tr key={parent.id}>
                          <td>{parent.id}</td>
                          <td>{parent.fullName}</td>
                          <td>{parent.phoneNumber}</td>
                          <td>{parent.email}</td>
                          <td>{parent.address}</td>
                          <td>{parent.relationshipType}</td>
                          <td>
                            {sentNotifications.has(parent.id) ? (
                              <span className="text-success fw-bold">Đã gửi</span>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleOpenNotificationModal(parent)}
                              >
                                <FaPaperPlane /> Gửi
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Không tìm thấy phụ huynh nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal gửi thông báo */}
      <Modal show={showNotificationModal} onHide={handleCloseNotificationModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isSendingToAll 
              ? `Gửi thông báo cho ${filteredParents.length} phụ huynh`
              : `Gửi thông báo cho phụ huynh: ${selectedParent?.fullName}`
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSendNotification}>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề thông báo <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề thông báo"
                name="title"
                value={notificationData.title}
                onChange={handleNotificationInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nội dung <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Nhập nội dung thông báo khám sức khỏe"
                name="message"
                value={notificationData.message}
                onChange={handleNotificationInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Loại thông báo</Form.Label>
              <Form.Control
                plaintext
                readOnly
                value="HEALTH_CHECKUP (Khám sức khỏe)"
              />
            </Form.Group>

            {/* Add a hidden field to ensure senderId is included */}
            <input 
              type="hidden" 
              name="senderId" 
              value={nurseId} 
            />
            
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handleCloseNotificationModal}>
                Hủy
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={sendingNotification}
              >
                {sendingNotification ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="me-2" /> Gửi thông báo
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CreateCheckupList;
