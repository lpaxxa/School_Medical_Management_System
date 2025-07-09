import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Card, Row, Col, Alert, Modal, Badge } from 'react-bootstrap';
import './PostVaccinationMonitoring.css';

const PostVaccinationMonitoring = ({ refreshData, onDataChange }) => {
  const [vaccinations, setVaccinations] = useState([]);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: [],
    severity: 'MILD',
    notes: '',
    followUpRequired: false,
    temperature: '',
    actionTaken: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Danh sách triệu chứng có thể chọn
  const symptomOptions = [
    { id: 'FEVER', label: 'Sốt' },
    { id: 'PAIN', label: 'Đau tại chỗ tiêm' },
    { id: 'REDNESS', label: 'Đỏ tại chỗ tiêm' },
    { id: 'SWELLING', label: 'Sưng tại chỗ tiêm' },
    { id: 'HEADACHE', label: 'Đau đầu' },
    { id: 'FATIGUE', label: 'Mệt mỏi' },
    { id: 'NAUSEA', label: 'Buồn nôn' },
    { id: 'DIZZINESS', label: 'Chóng mặt' },
    { id: 'RASH', label: 'Phát ban' },
    { id: 'OTHER', label: 'Khác' },
  ];

  // Mock data - thay thế bằng API call trong môi trường thực tế
  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setVaccinations([
        {
          id: 1,
          studentId: 'SV001',
          studentName: 'Nguyễn Văn A',
          className: '6A1',
          vaccineName: 'Sởi-Rubella',
          vaccinationDate: '2025-06-10',
          batchNumber: 'MR20250610',
          monitoringStatus: 'NOT_STARTED',
          lastCheckedAt: null
        },
        {
          id: 2,
          studentId: 'SV002',
          studentName: 'Trần Thị B',
          className: '6A1',
          vaccineName: 'Sởi-Rubella',
          vaccinationDate: '2025-06-10',
          batchNumber: 'MR20250610',
          monitoringStatus: 'IN_PROGRESS',
          lastCheckedAt: '2025-06-10T10:30:00'
        },
        {
          id: 3,
          studentId: 'SV003',
          studentName: 'Lê Văn C',
          className: '6A2',
          vaccineName: 'Viêm gan B',
          vaccinationDate: '2025-06-08',
          batchNumber: 'HB20250608',
          monitoringStatus: 'COMPLETED',
          lastCheckedAt: '2025-06-09T14:15:00'
        },
        {
          id: 4,
          studentId: 'SV004',
          studentName: 'Phạm Thị D',
          className: '6A2',
          vaccineName: 'HPV',
          vaccinationDate: '2025-06-09',
          batchNumber: 'HPV20250609',
          monitoringStatus: 'REQUIRES_ATTENTION',
          lastCheckedAt: '2025-06-09T11:45:00'
        }
      ]);
      setLoading(false);
    }, 500);
  }, [refreshData]);

  // Lọc danh sách tiêm chủng theo điều kiện tìm kiếm
  const filteredVaccinations = vaccinations.filter(vacc => {
    const matchesSearch = 
      vacc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      vacc.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacc.className.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || vacc.monitoringStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Xử lý chọn vaccination để theo dõi
  const handleSelectVaccination = (vaccination) => {
    setSelectedVaccination(vaccination);
    setFormData({
      symptoms: [],
      severity: 'MILD',
      notes: '',
      followUpRequired: false,
      temperature: '',
      actionTaken: ''
    });
    setShowModal(true);
  };

  // Xử lý thay đổi form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Xử lý chọn/bỏ chọn triệu chứng
  const handleSymptomToggle = (symptomId) => {
    if (formData.symptoms.includes(symptomId)) {
      setFormData({
        ...formData,
        symptoms: formData.symptoms.filter(id => id !== symptomId)
      });
    } else {
      setFormData({
        ...formData,
        symptoms: [...formData.symptoms, symptomId]
      });
    }
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedVaccination) return;
    
    // Chuẩn bị dữ liệu
    const monitoringData = {
      vaccinationId: selectedVaccination.id,
      symptoms: formData.symptoms,
      severity: formData.severity,
      notes: formData.notes,
      temperature: formData.temperature,
      followUpRequired: formData.followUpRequired,
      actionTaken: formData.actionTaken,
      recordedAt: new Date().toISOString()
    };
    
    // Giả lập API call
    console.log('Submitting monitoring data:', monitoringData);
    
    // Update local state để hiển thị UI ngay lập tức
    const updatedVaccinations = vaccinations.map(v => {
      if (v.id === selectedVaccination.id) {
        let newStatus = 'IN_PROGRESS';
        if (formData.followUpRequired || formData.severity === 'SEVERE') {
          newStatus = 'REQUIRES_ATTENTION';
        } else if (!formData.followUpRequired && formData.symptoms.length === 0) {
          newStatus = 'COMPLETED';
        }
        
        return {
          ...v,
          monitoringStatus: newStatus,
          lastCheckedAt: new Date().toISOString()
        };
      }
      return v;
    });
    
    setVaccinations(updatedVaccinations);
    setShowModal(false);
    setSelectedVaccination(null);
    
    setMessage({
      type: 'success',
      text: 'Đã cập nhật thông tin theo dõi sau tiêm!'
    });
    
    // Thông báo thay đổi dữ liệu
    if (onDataChange) onDataChange();
  };

  // Hàm lấy badge class theo trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'NOT_STARTED':
        return <Badge bg="secondary">Chưa theo dõi</Badge>;
      case 'IN_PROGRESS':
        return <Badge bg="primary">Đang theo dõi</Badge>;
      case 'COMPLETED':
        return <Badge bg="success">Hoàn thành</Badge>;
      case 'REQUIRES_ATTENTION':
        return <Badge bg="danger">Cần chú ý</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  return (
    <div className="post-vaccination-monitoring">
      <div className="section-header">
        <h2>Theo dõi sau tiêm chủng</h2>
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
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="NOT_STARTED">Chưa theo dõi</option>
                  <option value="IN_PROGRESS">Đang theo dõi</option>
                  <option value="REQUIRES_ATTENTION">Cần chú ý</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
              >
                <i className="fas fa-redo"></i> Đặt lại
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div className="vaccination-table-container">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Mã HS</th>
              <th>Họ tên</th>
              <th>Lớp</th>
              <th>Vắc-xin</th>
              <th>Ngày tiêm</th>
              <th>Trạng thái theo dõi</th>
              <th>Lần kiểm tra gần nhất</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : filteredVaccinations.length > 0 ? (
              filteredVaccinations.map(vaccination => (
                <tr key={vaccination.id}>
                  <td>{vaccination.studentId}</td>
                  <td>{vaccination.studentName}</td>
                  <td>{vaccination.className}</td>
                  <td>{vaccination.vaccineName}</td>
                  <td>{new Date(vaccination.vaccinationDate).toLocaleDateString('vi-VN')}</td>
                  <td>{getStatusBadge(vaccination.monitoringStatus)}</td>
                  <td>
                    {vaccination.lastCheckedAt 
                      ? new Date(vaccination.lastCheckedAt).toLocaleString('vi-VN')
                      : 'Chưa kiểm tra'}
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSelectVaccination(vaccination)}
                    >
                      <i className="fas fa-stethoscope"></i> Theo dõi
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  Không tìm thấy dữ liệu tiêm chủng nào
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      
      {/* Modal nhập dữ liệu theo dõi */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Theo dõi sau tiêm chủng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVaccination && (
            <div className="student-info mb-3">
              <h5>Thông tin học sinh</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Học sinh:</strong> {selectedVaccination.studentName}</p>
                  <p><strong>Mã học sinh:</strong> {selectedVaccination.studentId}</p>
                  <p><strong>Lớp:</strong> {selectedVaccination.className}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Vắc-xin:</strong> {selectedVaccination.vaccineName}</p>
                  <p><strong>Ngày tiêm:</strong> {new Date(selectedVaccination.vaccinationDate).toLocaleDateString('vi-VN')}</p>
                  <p><strong>Số lô:</strong> {selectedVaccination.batchNumber}</p>
                </Col>
              </Row>
            </div>
          )}
          
          <Form onSubmit={handleSubmit}>
            <h5>Ghi nhận theo dõi sau tiêm</h5>
            
            <Form.Group className="mb-3">
              <Form.Label>Nhiệt độ (°C)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                placeholder="Ví dụ: 36.8"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Các triệu chứng (nếu có)</Form.Label>
              <div className="symptoms-list">
                <Row>
                  {symptomOptions.map((symptom) => (
                    <Col md={4} key={symptom.id}>
                      <Form.Check 
                        type="checkbox"
                        id={`symptom-${symptom.id}`}
                        label={symptom.label}
                        checked={formData.symptoms.includes(symptom.id)}
                        onChange={() => handleSymptomToggle(symptom.id)}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            </Form.Group>
            
            {formData.symptoms.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Mức độ nghiêm trọng</Form.Label>
                <Form.Select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                >
                  <option value="MILD">Nhẹ</option>
                  <option value="MODERATE">Trung bình</option>
                  <option value="SEVERE">Nghiêm trọng</option>
                </Form.Select>
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Biện pháp đã thực hiện</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="actionTaken"
                value={formData.actionTaken}
                onChange={handleInputChange}
                placeholder="Mô tả biện pháp đã thực hiện (nếu có)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú thêm</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ghi chú bổ sung về tình trạng học sinh"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="followUpRequired"
                label="Cần theo dõi tiếp"
                name="followUpRequired"
                checked={formData.followUpRequired}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <i className="fas fa-save"></i> Lưu thông tin theo dõi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PostVaccinationMonitoring;