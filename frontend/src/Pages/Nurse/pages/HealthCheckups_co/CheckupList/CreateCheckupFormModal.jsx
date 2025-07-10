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
        height: 135.2,
        weight: 32.5,
        bmi: 17.7,
        bloodPressure: "100/65",
        visionLeft: "7/10",
        visionRight: "8/10",
        hearingStatus: "Bình thường",
        heartRate: 82,
        bodyTemperature: 36.8,
        diagnosis: "Sức khỏe ổn định, có dấu hiệu cận thị nhẹ mắt trái",
        recommendations: "Khuyến nghị đi khám chuyên khoa mắt để kiểm tra khúc xạ, tăng cường ánh sáng nơi học tập",
        followUpNeeded: true
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

  if (!student) return null;

  return (
    <Modal show={show} onHide={onClose} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Tạo Hồ sơ Khám cho: {student.studentName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="form-section">
            <h5>Thông tin chung</h5>
            <Row>
              <Col md={4}><p><strong>Học sinh:</strong> {student.studentName}</p></Col>
              <Col md={4}><p><strong>Lớp:</strong> {student.studentClass}</p></Col>
              <Col md={4}><p><strong>Chiến dịch:</strong> {campaign?.title}</p></Col>
            </Row>
            <Row>
                <Col md={4}>
                    <Form.Group controlId="checkupDate">
                        <Form.Label>Ngày khám</Form.Label>
                        <Form.Control type="date" name="checkupDate" value={formData.checkupDate || ''} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="checkupType">
                        <Form.Label>Loại hình khám</Form.Label>
                        <Form.Control type="text" name="checkupType" value={formData.checkupType || ''} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="checkupStatus">
                        <Form.Label>Trạng thái khám</Form.Label>
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
            <Row>
                <Col md={3}><Form.Group><Form.Label>Chiều cao (cm)</Form.Label><Form.Control type="number" name="height" value={formData.height || ''} onChange={handleChange} /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>Cân nặng (kg)</Form.Label><Form.Control type="number" name="weight" value={formData.weight || ''} onChange={handleChange} /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>BMI</Form.Label><Form.Control type="number" name="bmi" value={formData.bmi || ''} readOnly /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>Huyết áp</Form.Label><Form.Control type="text" name="bloodPressure" value={formData.bloodPressure || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Row>
                <Col md={3}><Form.Group><Form.Label>Thị lực (Trái)</Form.Label><Form.Control type="text" name="visionLeft" value={formData.visionLeft || ''} onChange={handleChange} /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>Thị lực (Phải)</Form.Label><Form.Control type="text" name="visionRight" value={formData.visionRight || ''} onChange={handleChange} /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>Thính lực</Form.Label><Form.Control type="text" name="hearingStatus" value={formData.hearingStatus || ''} onChange={handleChange} /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>Nhịp tim</Form.Label><Form.Control type="number" name="heartRate" value={formData.heartRate || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
             <Row>
                <Col md={3}><Form.Group><Form.Label>Nhiệt độ (°C)</Form.Label><Form.Control type="number" step="0.1" name="bodyTemperature" value={formData.bodyTemperature || ''} onChange={handleChange} /></Form.Group></Col>
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
            <Row>
                <Col>
                    <Form.Group controlId="diagnosis">
                        <Form.Label>Chẩn đoán</Form.Label>
                        <Form.Control as="textarea" rows={3} name="diagnosis" value={formData.diagnosis || ''} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group controlId="recommendations">
                        <Form.Label>Đề nghị</Form.Label>
                        <Form.Control as="textarea" rows={3} name="recommendations" value={formData.recommendations || ''} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>
            {/* <Form.Group className="mt-3" controlId="followUpNeeded">
              <Form.Check type="checkbox" name="followUpNeeded" label="Cần theo dõi thêm" checked={formData.followUpNeeded || false} onChange={handleChange} />
            </Form.Group> */}
          </div>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>Hủy</Button>
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