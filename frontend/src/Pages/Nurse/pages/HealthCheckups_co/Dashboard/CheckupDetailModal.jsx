import React from 'react';
import { Modal, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaUser, FaBuilding, FaCalendarAlt, FaStethoscope, FaClipboardList, FaInfoCircle } from 'react-icons/fa';

const CheckupDetailModal = ({ show, onHide, details, loading }) => {
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge bg="success">Đã hoàn thành</Badge>;
            case 'NEED_FOLLOW_UP':
                return <Badge bg="warning">Cần theo dõi</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaInfoCircle className="me-2" />
                    Chi tiết Lượt khám
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center"><Spinner animation="border" /> <p>Đang tải dữ liệu...</p></div>
                ) : !details ? (
                    <Alert variant="warning">Không tìm thấy thông tin chi tiết.</Alert>
                ) : (
                    <div>
                        {/* Section: Student & Campaign Info */}
                        <div className="detail-section">
                            <h5>Thông tin chung</h5>
                            <Row>
                                <Col md={6}><p><strong><FaUser /> Học sinh:</strong> {details.studentName}</p></Col>
                                <Col md={6}><p><strong><FaBuilding /> Lớp:</strong> {details.studentClass}</p></Col>
                                <Col md={6}><p><strong><FaClipboardList /> Chiến dịch:</strong> {details.campaignTitle}</p></Col>
                                <Col md={6}><p><strong><FaCalendarAlt /> Ngày khám:</strong> {formatDate(details.checkupDate)}</p></Col>
                            </Row>
                        </div>
                        <hr />
                        {/* Section: Checkup Details */}
                        <div className="detail-section">
                            <h5>Kết quả khám</h5>
                            <Row>
                                <Col md={4}><p><strong>Trạng thái:</strong> {renderStatusBadge(details.checkupStatus)}</p></Col>
                                <Col md={4}><p><strong>Loại khám:</strong> {details.checkupType}</p></Col>
                                <Col md={4}><p><strong>Nhân viên y tế:</strong> {details.medicalStaffName}</p></Col>
                            </Row>
                            <Row>
                                <Col md={3}><p><strong>Chiều cao:</strong> {details.height} cm</p></Col>
                                <Col md={3}><p><strong>Cân nặng:</strong> {details.weight} kg</p></Col>
                                <Col md={3}><p><strong>BMI:</strong> {details.bmi}</p></Col>
                                <Col md={3}><p><strong>Huyết áp:</strong> {details.bloodPressure}</p></Col>
                            </Row>
                             <Row>
                                <Col md={3}><p><strong>Thị lực (T):</strong> {details.visionLeft}</p></Col>
                                <Col md={3}><p><strong>Thị lực (P):</strong> {details.visionRight}</p></Col>
                                <Col md={3}><p><strong>Thính lực:</strong> {details.hearingStatus}</p></Col>
                                <Col md={3}><p><strong>Nhịp tim:</strong> {details.heartRate} bpm</p></Col>
                            </Row>
                             <Row>
                                <Col md={4}><p><strong>Nhiệt độ:</strong> {details.bodyTemperature} °C</p></Col>
                            </Row>
                        </div>
                        <hr />
                        {/* Section: Diagnosis & Recommendations */}
                        <div className="detail-section">
                             <h5><FaStethoscope /> Chẩn đoán & Đề nghị</h5>
                             <p><strong>Chẩn đoán:</strong></p>
                             <p className="text-muted">{details.diagnosis || 'Không có'}</p>
                             <p><strong>Đề nghị:</strong></p>
                             <p className="text-muted">{details.recommendations || 'Không có'}</p>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CheckupDetailModal; 