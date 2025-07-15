import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../../../../../context/AuthContext';
import Swal from 'sweetalert2';
import './CreateCheckupFormModal.css';

const CreateCheckupFormModal = ({ show, onClose, student, campaign, onSubmit }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getInitialData = () => ({
    studentId: student.studentId,
    healthCampaignId: campaign.id,
    parentConsentId: student.parentConsentId,
    medicalStaffId: currentUser?.id || 1, 
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
    notes: '',
  });

  useEffect(() => {
    if (show && student && campaign) {
      setFormData(getInitialData());
      setErrors({});
    }
  }, [show, student, campaign, currentUser]);

  useEffect(() => {
    if (formData.height > 0 && formData.weight > 0) {
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
      setFormData(prev => ({ ...prev, bmi }));
    } else {
      setFormData(prev => ({ ...prev, bmi: '' }));
    }
  }, [formData.height, formData.weight]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.checkupDate) newErrors.checkupDate = 'Ngày khám là bắt buộc.';
    if (!formData.checkupType) newErrors.checkupType = 'Loại hình khám là bắt buộc.';
    if (!formData.checkupStatus) newErrors.checkupStatus = 'Trạng thái là bắt buộc.';

    const numericFields = ['height', 'weight', 'heartRate', 'bodyTemperature'];
    numericFields.forEach(field => {
      if (formData[field] && (isNaN(formData[field]) || Number(formData[field]) <= 0)) {
        newErrors[field] = 'Giá trị phải là một số dương.';
      }
    });

    if (formData.bloodPressure && !/^\d+\/\d+$/.test(formData.bloodPressure)) {
      newErrors.bloodPressure = 'Định dạng huyết áp không hợp lệ (ví dụ: 120/80).';
    }
    if (formData.visionLeft && !/^\d+\/\d+$/.test(formData.visionLeft)) {
      newErrors.visionLeft = 'Định dạng thị lực không hợp lệ (ví dụ: 10/10).';
    }
    if (formData.visionRight && !/^\d+\/\d+$/.test(formData.visionRight)) {
      newErrors.visionRight = 'Định dạng thị lực không hợp lệ (ví dụ: 10/10).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Dữ liệu không hợp lệ',
        text: 'Vui lòng kiểm tra lại các trường đã tô đỏ.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose(); 
    } catch (error) {
      // Error is handled by the parent component's Swal
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(getInitialData());
    setErrors({});
  };

  if (!student) return null;

  return (
    <Modal show={show} onHide={onClose} size="xl" backdrop="static" dialogClassName="create-checkup-modal">
      <Modal.Header closeButton>
        <Modal.Title>Tạo Hồ sơ Khám cho: {student.studentName}</Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="form-section">
            <h5>Thông tin chung</h5>
            <Row className="mb-3 info-text">
              <Col md={4}><p><strong>Học sinh:</strong> {student.studentName}</p></Col>
              <Col md={4}><p><strong>Lớp:</strong> {student.studentClass}</p></Col>
              <Col md={4}><p><strong>Chiến dịch:</strong> {campaign?.title}</p></Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group controlId="checkupDate">
                  <Form.Label>Ngày khám</Form.Label>
                  <Form.Control type="date" name="checkupDate" value={formData.checkupDate || ''} onChange={handleChange} isInvalid={!!errors.checkupDate} required />
                  <Form.Control.Feedback type="invalid">{errors.checkupDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="checkupType">
                  <Form.Label>Loại hình khám</Form.Label>
                  <Form.Control type="text" name="checkupType" value={formData.checkupType || ''} onChange={handleChange} isInvalid={!!errors.checkupType} required />
                   <Form.Control.Feedback type="invalid">{errors.checkupType}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="checkupStatus">
                  <Form.Label>Trạng thái khám</Form.Label>
                  <Form.Select name="checkupStatus" value={formData.checkupStatus || 'COMPLETED'} onChange={handleChange} isInvalid={!!errors.checkupStatus} required>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="NEED_FOLLOW_UP">Cần theo dõi</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.checkupStatus}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <h5>Các chỉ số sức khỏe</h5>
            <Row className="mb-3">
              <Col md={4}><Form.Group><Form.Label>Chiều cao (cm)</Form.Label><Form.Control type="number" step="0.1" name="height" value={formData.height || ''} onChange={handleChange} isInvalid={!!errors.height} placeholder="Nhập chiều cao..." /><Form.Control.Feedback type="invalid">{errors.height}</Form.Control.Feedback></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Cân nặng (kg)</Form.Label><Form.Control type="number" step="0.1" name="weight" value={formData.weight || ''} onChange={handleChange} isInvalid={!!errors.weight} placeholder="Nhập cân nặng..." /><Form.Control.Feedback type="invalid">{errors.weight}</Form.Control.Feedback></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>BMI</Form.Label><Form.Control type="number" name="bmi" value={formData.bmi || ''} readOnly placeholder="Tự động tính"/></Form.Group></Col>
            </Row>
            <Row className="mb-3">
              <Col md={3}><Form.Group><Form.Label>Huyết áp</Form.Label><Form.Control type="text" name="bloodPressure" value={formData.bloodPressure || ''} onChange={handleChange} isInvalid={!!errors.bloodPressure} placeholder="VD: 120/80" /><Form.Control.Feedback type="invalid">{errors.bloodPressure}</Form.Control.Feedback></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Thị lực (Trái)</Form.Label><Form.Control type="text" name="visionLeft" value={formData.visionLeft || ''} onChange={handleChange} isInvalid={!!errors.visionLeft} placeholder="VD: 10/10" /><Form.Control.Feedback type="invalid">{errors.visionLeft}</Form.Control.Feedback></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Thị lực (Phải)</Form.Label><Form.Control type="text" name="visionRight" value={formData.visionRight || ''} onChange={handleChange} isInvalid={!!errors.visionRight} placeholder="VD: 10/10" /><Form.Control.Feedback type="invalid">{errors.visionRight}</Form.Control.Feedback></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Thính lực</Form.Label><Form.Control type="text" name="hearingStatus" value={formData.hearingStatus || ''} onChange={handleChange} placeholder="VD: Bình thường" /></Form.Group></Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Group><Form.Label>Nhịp tim (bpm)</Form.Label><Form.Control type="number" name="heartRate" value={formData.heartRate || ''} onChange={handleChange} isInvalid={!!errors.heartRate} placeholder="VD: 80" /><Form.Control.Feedback type="invalid">{errors.heartRate}</Form.Control.Feedback></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Nhiệt độ (°C)</Form.Label><Form.Control type="number" step="0.1" name="bodyTemperature" value={formData.bodyTemperature || ''} onChange={handleChange} isInvalid={!!errors.bodyTemperature} placeholder="VD: 36.5" /><Form.Control.Feedback type="invalid">{errors.bodyTemperature}</Form.Control.Feedback></Form.Group></Col>
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
              <Col md={12} className="mb-3"><Form.Group controlId="diagnosis"><Form.Label>Chẩn đoán</Form.Label><Form.Control as="textarea" rows={3} name="diagnosis" value={formData.diagnosis || ''} onChange={handleChange} placeholder="Nhập chẩn đoán sức khỏe của học sinh..."/></Form.Group></Col>
              <Col md={12}><Form.Group controlId="notes"><Form.Label>Đề nghị</Form.Label><Form.Control as="textarea" rows={3} name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Nhập các đề nghị, khuyến cáo cho học sinh..."/></Form.Group></Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button variant="warning" onClick={handleReset} disabled={isLoading}>Đặt lại</Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? <><Spinner as="span" animation="border" size="sm" /> Đang lưu...</> : 'Lưu Hồ sơ'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateCheckupFormModal; 