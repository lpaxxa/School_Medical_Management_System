import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Table, Alert, Row, Col, Card, Tabs, Tab, Modal, Badge, Dropdown } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { useAuth } from '../../../../../context/AuthContext';
import './CreateCheckupList.css';
import { FaEye, FaPaperPlane, FaUsers, FaInfoCircle } from 'react-icons/fa';
import LoadingSpinner from '../../../../../components/LoadingSpinner/LoadingSpinner';

const CreateCheckupList = ({ refreshData }) => {
  const [activeTab, setActiveTab] = useState('plans');
  const { currentUser } = useAuth();
  
  const { 
    loading, 
    error, 
    getHealthCampaigns, 
    getParents, 
    getStudents, 
    getStudentById, 
    getParentById, 
    sendCampaignNotifications 
  } = useHealthCheckup();
  
  const [planSearchTerm, setPlanSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [gradeLevelFilter, setGradeLevelFilter] = useState('');
  
  const [sendingNotification, setSendingNotification] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const nurseId = currentUser?.id ? parseInt(currentUser.id) : 1;
  
  const [campaigns, setCampaigns] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [sentNotifications, setSentNotifications] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLocalLoading(true);
        const [campaignsData, parentsData, studentsData] = await Promise.all([
          getHealthCampaigns(),
          getParents(),
          getStudents()
        ]);
        setCampaigns(campaignsData);
        setParents(parentsData);
        setStudents(studentsData);
        setLocalLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setLocalLoading(false);
      }
    };
    fetchData();
  }, [refreshData, getHealthCampaigns, getParents, getStudents]);

  useEffect(() => {
    if (students.length > 0 && parents.length > 0) {
      const parentsMap = new Map(parents.map(p => [p.id, p]));
      const joinedData = students.map(student => ({
        ...student,
        parentInfo: parentsMap.get(student.parentId) || null
      }));
      setCombinedData(joinedData);
    }
  }, [students, parents]);

  const uniqueGradeLevels = useMemo(() => {
    if (!students || students.length === 0) return [];
    const gradeLevelSet = new Set(students.map(s => s.gradeLevel).filter(Boolean));
    return Array.from(gradeLevelSet).sort();
  }, [students]);

  const activeCampaigns = useMemo(() => {
    return campaigns.filter(c => c.status === 'ONGOING');
  }, [campaigns]);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.title?.toLowerCase().includes(planSearchTerm.toLowerCase()) ||
      campaign.notes?.toLowerCase().includes(planSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStudents = combinedData.filter(student => {
    const matchesSearch =
      !studentSearchTerm ||
      student.fullName?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      (student.parentInfo?.fullName?.toLowerCase().includes(studentSearchTerm.toLowerCase()));
    const matchesGrade = !gradeLevelFilter || student.gradeLevel === gradeLevelFilter;
    return matchesSearch && matchesGrade;
  });

  const handleSendNotifications = async (studentIds, campaignId) => {
    if (!campaignId) {
      toast.warn('Lỗi: Không có chiến dịch nào được chọn.');
      return;
    }
    if (!studentIds || studentIds.length === 0) {
      toast.warn('Không có học sinh nào được chọn để gửi thông báo.');
      return;
    }
    
    setSendingNotification(true);
    try {
      await sendCampaignNotifications(campaignId, studentIds);
  
      const newSent = new Set(sentNotifications);
      studentIds.forEach(id => newSent.add(`${campaignId}-${id}`));
      setSentNotifications(newSent);
  
      toast.success(`Đã gửi thông báo thành công cho ${studentIds.length} học sinh.`);
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error(`Gửi thông báo thất bại: ${error.message}`);
    } finally {
      setSendingNotification(false);
    }
  };

  const handleShowStudentDetail = async (student) => {
    setShowStudentDetailModal(true);
    setDetailLoading(true);
    try {
      const [studentDetails, parentDetails] = await Promise.all([
        getStudentById(student.id),
        student.parentId ? getParentById(student.parentId) : Promise.resolve(null)
      ]);
      setSelectedStudentForDetail({ student: studentDetails, parent: parentDetails });
    } catch (err) {
      console.error("Error fetching details:", err);
      toast.error('Không thể tải chi tiết thông tin.');
      setSelectedStudentForDetail({ student: student, parent: student.parentInfo });
    } finally {
      setDetailLoading(false);
    }
  };
  
  const handleCloseStudentDetailModal = () => {
    setShowStudentDetailModal(false);
    setSelectedStudentForDetail(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PREPARING': return 'warning';
      case 'ONGOING': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'PREPARING': return 'Đang chuẩn bị';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="create-checkup-list">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="section-header">
        <h2>Quản lý khám sức khỏe</h2>
      </div>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
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
                    <option value="ONGOING">Đang diễn ra</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
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
                      <th>Ngày kết thúc</th>
                      <th>Ghi chú</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localLoading ? (
                      <tr><td colSpan="6" className="text-center"><LoadingSpinner /></td></tr>
                    ) : filteredCampaigns.length > 0 ? (
                      filteredCampaigns.map(campaign => (
                        <tr key={campaign.id}>
                          <td>{campaign.id}</td>
                          <td>{campaign.title}</td>
                          <td>{formatDate(campaign.startDate)}</td>
                          <td>{formatDate(campaign.endDate)}</td>
                          <td>{campaign.notes}</td>
                          <td><Badge bg={getStatusBadgeColor(campaign.status)}>{translateStatus(campaign.status)}</Badge></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="text-center">Không tìm thấy chiến dịch.</td></tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="students" title="Danh sách học sinh">
          <Card>
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              <span>Danh sách học sinh</span>
              <Dropdown>
                <Dropdown.Toggle 
                variant="primary" 
                size="sm"
                  id="dropdown-send-all"
                  disabled={filteredStudents.length === 0 || sendingNotification}
                >
                  <FaUsers className="me-2" />
                  Gửi thông báo cho tất cả ({filteredStudents.length})
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>Chọn chiến dịch để gửi</Dropdown.Header>
                  {activeCampaigns.length > 0 ? (
                    activeCampaigns.map(campaign => (
                      <Dropdown.Item 
                        key={campaign.id}
                        onClick={() => handleSendNotifications(filteredStudents.map(s => s.id), campaign.id)}
                      >
                        {campaign.title}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled>Không có chiến dịch nào đang diễn ra</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={8}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo mã, tên học sinh hoặc tên phụ huynh..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={gradeLevelFilter}
                    onChange={(e) => setGradeLevelFilter(e.target.value)}
                  >
                    <option value="">Tất cả các khối</option>
                    {uniqueGradeLevels.map(gradeLevel => (
                      <option key={gradeLevel} value={gradeLevel}>{gradeLevel}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Mã HS</th>
                      <th>Họ tên học sinh</th>
                      <th>Lớp</th>
                      <th>Tên phụ huynh</th>
                      <th>Quan hệ</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localLoading ? (
                      <tr><td colSpan="6" className="text-center"><LoadingSpinner /></td></tr>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <tr key={student.id}>
                          <td>{student.studentId}</td>
                          <td>{student.fullName}</td>
                          <td>{student.gradeLevel}</td>
                          <td>{student.parentInfo?.fullName || 'N/A'}</td>
                          <td>{student.parentInfo?.relationshipType || 'N/A'}</td>
                          <td className="d-flex">
                            <Button variant="info" size="sm" className="me-2" onClick={() => handleShowStudentDetail(student)}>
                              <FaEye />
                            </Button>
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="success"
                                size="sm"
                                id={`dropdown-send-${student.id}`}
                                disabled={sendingNotification}
                              >
                                <FaPaperPlane />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Header>Chọn chiến dịch</Dropdown.Header>
                                {activeCampaigns.length > 0 ? (
                                  activeCampaigns.map(campaign => {
                                    const isSent = sentNotifications.has(`${campaign.id}-${student.id}`);
                                    return (
                                      <Dropdown.Item
                                        key={campaign.id}
                                        onClick={() => !isSent && handleSendNotifications([student.id], campaign.id)}
                                        disabled={isSent}
                                      >
                                        {campaign.title} {isSent && <Badge pill bg="success" className="ms-2">Đã gửi</Badge>}
                                      </Dropdown.Item>
                                    );
                                  })
                                ) : (
                                  <Dropdown.Item disabled>Không có chiến dịch nào</Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="text-center">Không tìm thấy học sinh.</td></tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <Modal show={showStudentDetailModal} onHide={handleCloseStudentDetailModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FaInfoCircle className="me-2" /> Chi tiết thông tin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <LoadingSpinner />
          ) : selectedStudentForDetail ? (
            <>
              <Card className="mb-4">
                <Card.Header as="h5">Thông tin học sinh</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4} className="text-center">
                      <img src={selectedStudentForDetail.student.imageUrl || '/src/assets/default-avatar.png'} alt={selectedStudentForDetail.student.fullName} className="img-fluid rounded-circle mb-3" style={{ width: '120px', height: '120px' }} />
                    </Col>
                    <Col md={8}>
                      <p><strong>Họ và tên:</strong> {selectedStudentForDetail.student.fullName}</p>
                      <p><strong>Mã học sinh:</strong> {selectedStudentForDetail.student.studentId}</p>
                      <p><strong>Giới tính:</strong> {selectedStudentForDetail.student.gender}</p>
                      <p><strong>Ngày sinh:</strong> {formatDate(selectedStudentForDetail.student.dateOfBirth)}</p>
                      <p><strong>Lớp:</strong> {selectedStudentForDetail.student.className}</p>
                      <p><strong>Khối:</strong> {selectedStudentForDetail.student.gradeLevel}</p>
                      <p><strong>Năm học:</strong> {selectedStudentForDetail.student.schoolYear}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card>
                <Card.Header as="h5">Thông tin phụ huynh</Card.Header>
                <Card.Body>
                  {selectedStudentForDetail.parent ? (
                    <>
                      <p><strong>Họ và tên:</strong> {selectedStudentForDetail.parent.fullName}</p>
                      <p><strong>Quan hệ:</strong> {selectedStudentForDetail.parent.relationshipType}</p>
                      <p><strong>Số điện thoại:</strong> {selectedStudentForDetail.parent.phoneNumber}</p>
                      <p><strong>Email:</strong> {selectedStudentForDetail.parent.email}</p>
                      <p><strong>Địa chỉ:</strong> {selectedStudentForDetail.parent.address}</p>
                      <p><strong>Nghề nghiệp:</strong> {selectedStudentForDetail.parent.occupation || 'Chưa cập nhật'}</p>
                  </>
                ) : (
                    <Alert variant="warning">Không tìm thấy thông tin phụ huynh cho học sinh này.</Alert>
                  )}
                </Card.Body>
              </Card>
            </>
          ) : (
            <Alert variant="info">Không có thông tin chi tiết để hiển thị.</Alert>  
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseStudentDetailModal}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateCheckupList;
