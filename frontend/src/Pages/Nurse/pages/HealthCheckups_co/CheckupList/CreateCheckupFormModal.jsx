import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../../../../../context/AuthContext';
import './CreateCheckupFormModal.css';

const CreateCheckupFormModal = ({ show, onClose, student, campaign, onSubmit }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student && campaign) {
      const initialData = {
        studentId: student.studentId,
        healthCampaignId: campaign.id,
        parentConsentId: student.parentConsentId,
        medicalStaffId: currentUser?.id ? 1 : 1, // Default to 1 as per requirement
        checkupDate: new Date().toISOString().split('T')[0],
        checkupType: "Khám tổng quát định kỳ",
        checkupStatus: "COMPLETED",
        specialCheckupItems: student.specialCheckupItems || [],
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
        followUpNeeded: false
      };
      setFormData(initialData);
    }
  }, [show, student, campaign, currentUser]);

  useEffect(() => {
    if (formData.height > 0 && formData.weight > 0) {
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
      setFormData(prev => ({ ...prev, bmi }));
    }
  }, [formData.height, formData.weight]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      // Add a small delay to allow toast to show before closing modal
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      // Error is handled by the parent component's toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (student && campaign) {
      const initialData = {
        studentId: student.studentId,
        healthCampaignId: campaign.id,
        parentConsentId: student.parentConsentId,
        medicalStaffId: currentUser?.id ? 1 : 1,
        checkupDate: new Date().toISOString().split('T')[0],
        checkupType: "Khám tổng quát định kỳ",
        checkupStatus: "COMPLETED",
        specialCheckupItems: student.specialCheckupItems || [],
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
        followUpNeeded: false
      };
      setFormData(initialData);
    }
  };

  if (!student) return null;

  return (
    <Modal show={show} onHide={onClose} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title style={{color : 'red' }}>Tạo Hồ sơ Khám cho: {student.studentName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="form-section">
            <h5>Thông tin chung</h5>
            <Row className="mb-3">
              <Col md={6}><p><strong>Học sinh:</strong> {student.studentName}</p></Col>
              <Col md={6}><p><strong>Lớp:</strong> {student.studentClass}</p></Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}><p><strong>Chiến dịch:</strong> {campaign?.title}</p></Col>
              <Col md={6}>
                <Form.Group controlId="checkupDate">
                  <Form.Label><strong>Ngày khám:</strong></Form.Label>
                  <Form.Control type="date" name="checkupDate" value={formData.checkupDate || ''} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="checkupType">
                  <Form.Label><strong>Loại hình khám:</strong></Form.Label>
                  <Form.Control type="text" name="checkupType" value={formData.checkupType || ''} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="checkupStatus">
                  <Form.Label><strong>Trạng thái khám:</strong></Form.Label>
                  <Form.Select name="checkupStatus" value={formData.checkupStatus || 'COMPLETED'} onChange={handleChange} required>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="NEED_FOLLOW_UP">Cần theo dõi</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <h5>Các chỉ số sức khỏe</h5>
            {/* Hàng 1: Chiều cao, Cân nặng, BMI */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Chiều cao (cm)</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.1"
                    name="height" 
                    value={formData.height || ''} 
                    onChange={handleChange}
                    placeholder="Nhập chiều cao..." 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Cân nặng (kg)</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.1"
                    name="weight" 
                    value={formData.weight || ''} 
                    onChange={handleChange}
                    placeholder="Nhập cân nặng..." 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>BMI</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.1"
                    name="bmi" 
                    value={formData.bmi || ''} 
                    readOnly 
                    placeholder="Tự động tính"
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* Hàng 2: Huyết áp, Thị lực (Trái), Thị lực (Phải) */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Huyết áp</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="bloodPressure" 
                    value={formData.bloodPressure || ''} 
                    onChange={handleChange}
                    placeholder="VD: 120/80" 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Thị lực (Trái)</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="visionLeft" 
                    value={formData.visionLeft || ''} 
                    onChange={handleChange}
                    placeholder="VD: 10/10" 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Thị lực (Phải)</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="visionRight" 
                    value={formData.visionRight || ''} 
                    onChange={handleChange}
                    placeholder="VD: 10/10" 
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* Hàng 3: Thính lực, Nhịp tim, Nhiệt độ */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Thính lực</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="hearingStatus" 
                    value={formData.hearingStatus || ''} 
                    onChange={handleChange}
                    placeholder="VD: Bình thường" 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Nhịp tim (bpm)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="heartRate" 
                    value={formData.heartRate || ''} 
                    onChange={handleChange}
                    placeholder="VD: 80" 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Nhiệt độ (°C)</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.1" 
                    name="bodyTemperature" 
                    value={formData.bodyTemperature || ''} 
                    onChange={handleChange}
                    placeholder="VD: 36.5" 
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <h5>Khám chuyên khoa (Từ PH)</h5>
            {formData.specialCheckupItems?.length > 0 ? (
                <ListGroup horizontal>
                    {formData.specialCheckupItems.map((item, index) => (
                        <ListGroup.Item key={index} as={Badge} bg="info" className="me-2">{item}</ListGroup.Item>
                    ))}
                </ListGroup>
             ) : (
                <p className="text-muted">Không có mục khám đặc biệt nào được chọn.</p>
             )}
          </div>

          <div className="form-section">
            <h5>Kết luận & Đề nghị</h5>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="diagnosis">
                  <Form.Label>Chẩn đoán</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    name="diagnosis" 
                    value={formData.diagnosis || ''} 
                    onChange={handleChange}
                    placeholder="Nhập chẩn đoán sức khỏe của học sinh..."
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="recommendations">
                  <Form.Label>Đề nghị</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    name="recommendations" 
                    value={formData.recommendations || ''} 
                    onChange={handleChange}
                    placeholder="Nhập các đề nghị, khuyến cáo cho học sinh..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>Hủy</Button>
            <Button variant="warning" onClick={handleReset} disabled={isLoading}>
              Đặt lại
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu Hồ sơ'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateCheckupFormModal; 