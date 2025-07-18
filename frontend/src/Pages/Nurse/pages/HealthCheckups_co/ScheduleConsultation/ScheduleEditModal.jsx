import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const ScheduleEditModal = ({ show, onHide, checkupData, onSubmit, loading, validated, errors, setCheckupData }) => {
    
    const [formData, setFormData] = useState(checkupData);

    useEffect(() => {
        setFormData(checkupData);
    }, [checkupData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (setCheckupData) {
            setCheckupData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Calculate BMI when height or weight changes
    useEffect(() => {
        if (formData.height > 0 && formData.weight > 0) {
            const heightInMeters = formData.height / 100;
            const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
            setFormData(prev => ({ ...prev, bmi }));
            if (setCheckupData) {
                setCheckupData(prev => ({ ...prev, bmi }));
            }
        }
    }, [formData.height, formData.weight, setCheckupData]);

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="xl" 
            dialogClassName="schedule-edit-checkup-modal"
            aria-labelledby="edit-checkup-modal"
            centered
        >
            <Modal.Header closeButton className="schedule-edit-modal-header">
                <Modal.Title id="edit-checkup-modal" className="schedule-edit-modal-title">
                    Chỉnh sửa Hồ sơ khám: {formData.studentName}
                </Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body className="schedule-edit-modal-body">
                    {/* General Info Section */}
                    <div className="schedule-form-section">
                        <h5>Thông tin chung (Không thể thay đổi)</h5>
                        <Row>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Mã học sinh</Form.Label>
                                    <Form.Control type="text" value={formData.studentId || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Học sinh</Form.Label>
                                    <Form.Control type="text" value={formData.studentName || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Lớp</Form.Label>
                                    <Form.Control type="text" value={formData.studentClass || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Checkup Info Section */}
                    <div className="schedule-form-section">
                        <h5>Thông tin khám</h5>
                        <Row>
                            <Col md={4}>
                                <Form.Group controlId="checkupDate">
                                    <Form.Label>Ngày khám</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        name="checkupDate" 
                                        value={formData.checkupDate || ''} 
                                        onChange={handleChange} 
                                        isInvalid={!!errors.checkupDate} 
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.checkupDate}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="checkupType">
                                    <Form.Label>Loại hình khám</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="checkupType" 
                                        value={formData.checkupType || ''} 
                                        onChange={handleChange} 
                                        placeholder="VD: Khám định kỳ" 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="checkupStatus">
                                    <Form.Label>Trạng thái khám</Form.Label>
                                    <Form.Select 
                                        name="checkupStatus" 
                                        value={formData.checkupStatus || ''} 
                                        onChange={handleChange} 
                                        isInvalid={!!errors.checkupStatus}
                                    >
                                        <option value="">Chọn trạng thái</option>
                                        <option value="COMPLETED">Đã hoàn thành</option>
                                        <option value="NEED_FOLLOW_UP">Cần theo dõi</option>
                                        <option value="CANCELLED">Đã hủy</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.checkupStatus}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Physical Measurements Section */}
                    <div className="schedule-form-section">
                        <h5>Chỉ số cơ thể</h5>
                        <Row>
                            <Col md={4} sm={6}>
                                <Form.Group controlId="height">
                                    <Form.Label>Chiều cao (cm)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        step="0.1" 
                                        name="height" 
                                        placeholder="VD: 165" 
                                        value={formData.height || ''} 
                                        onChange={handleChange} 
                                        isInvalid={!!errors.height} 
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.height}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4} sm={6}>
                                <Form.Group controlId="weight">
                                    <Form.Label>Cân nặng (kg)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        step="0.1" 
                                        name="weight" 
                                        placeholder="VD: 55" 
                                        value={formData.weight || ''} 
                                        onChange={handleChange} 
                                        isInvalid={!!errors.weight} 
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.weight}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4} sm={6}>
                                <Form.Group controlId="bmi">
                                    <Form.Label>BMI</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="bmi" 
                                        value={formData.bmi || ''} 
                                        readOnly 
                                        placeholder="Tự động tính" 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="bloodPressure">
                                    <Form.Label>Huyết áp</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="bloodPressure" 
                                        placeholder="VD: 120/80" 
                                        value={formData.bloodPressure || ''} 
                                        onChange={handleChange} 
                                        isInvalid={!!errors.bloodPressure} 
                                    />
                                     <Form.Control.Feedback type="invalid">{errors.bloodPressure}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="visionLeft">
                                    <Form.Label>Thị lực (Trái)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="visionLeft" 
                                        placeholder="VD: 12/20, 20/20" 
                                        value={formData.visionLeft || ''} 
                                        onChange={handleChange} 
                                        isInvalid={!!errors.visionLeft} 
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.visionLeft}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="visionRight">
                                    <Form.Label>Thị lực (Phải)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="visionRight" 
                                        placeholder="VD: 12/20, 20/20" 
                                        value={formData.visionRight || ''} 
                                        onChange={handleChange} 
                                        isInvalid={!!errors.visionRight} 
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.visionRight}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="hearingStatus">
                                    <Form.Label>Thính lực</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="hearingStatus" 
                                        placeholder="VD: Bình thường" 
                                        value={formData.hearingStatus || ''} 
                                        onChange={handleChange} 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} sm={6}>
                                <Form.Group controlId="heartRate">
                                    <Form.Label>Nhịp tim (bpm)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="heartRate" 
                                        placeholder="VD: 80" 
                                        value={formData.heartRate || ''} 
                                        onChange={handleChange} 
                                        isInvalid={!!errors.heartRate} 
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.heartRate}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6} sm={6}>
                                <Form.Group controlId="bodyTemperature">
                                    <Form.Label>Nhiệt độ (°C)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        step="0.1" 
                                        name="bodyTemperature" 
                                        placeholder="VD: 36.5" 
                                        value={formData.bodyTemperature || ''} 
                                        onChange={handleChange} 
                                        isInvalid={!!errors.bodyTemperature} 
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.bodyTemperature}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Diagnosis and Notes Section */}
                    <div className="schedule-form-section">
                        <h5>Chẩn đoán và Đề nghị</h5>
                         <Row>
                            <Col md={12}>
                                <Form.Group controlId="diagnosis">
                            <Form.Label>Chẩn đoán</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                name="diagnosis" 
                                value={formData.diagnosis || ''} 
                                onChange={handleChange} 
                            />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group controlId="recommendations">
                                    <Form.Label>Đề nghị của bác sĩ</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        name="recommendations" 
                                        value={formData.recommendations || ''} 
                                        onChange={handleChange} 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className="schedule-edit-modal-footer">
                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="schedule-save-btn" 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save me-1"></i>
                                Lưu thay đổi
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ScheduleEditModal;
