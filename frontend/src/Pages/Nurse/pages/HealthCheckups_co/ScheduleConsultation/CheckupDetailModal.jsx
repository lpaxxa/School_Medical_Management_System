import React from 'react';
import { Modal, Row, Col, Badge, Spinner, Alert, Card, ListGroup } from 'react-bootstrap';
import {
    FaUser, FaBuilding, FaCalendarAlt, FaStethoscope, FaClipboardList, FaInfoCircle,
    FaRulerVertical, FaWeight, FaHeartbeat, FaThermometerHalf, FaEye, FaNotesMedical, FaUserMd
} from 'react-icons/fa';
import './CheckupDetailModal.css';

const CheckupDetailModal = ({ show, onHide, checkup, loading }) => {
    
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
                return <Badge bg="success" className="detail-badge">Đã hoàn thành</Badge>;
            case 'NEED_FOLLOW_UP':
                return <Badge bg="warning" text="dark" className="detail-badge">Cần theo dõi</Badge>;
            case 'CANCELLED':
                return <Badge bg="danger" className="detail-badge">Đã hủy</Badge>;
            default:
                return <Badge bg="secondary" className="detail-badge">{status || 'Không xác định'}</Badge>;
        }
    };
    
    const renderParentNotifiedBadge = (status) => {
        return status ? 
            <Badge bg="success" className="detail-badge">Đã gửi</Badge> : 
            <Badge bg="secondary" className="detail-badge">Chưa gửi</Badge>;
    };

    const DetailItem = ({ icon, label, value }) => (
        <div className="detail-item mb-3">
            <div className="detail-item-header">
                {React.cloneElement(icon, { className: 'me-2 text-primary' })}
                <span className="fw-bold">{label}</span>
            </div>
            <div className="detail-item-value">
                {value || 'N/A'}
            </div>
        </div>
    );

    return (
        <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="checkup-detail-modal">
            <Modal.Header closeButton className="checkup-detail-modal-header">
                <Modal.Title>
                    <FaInfoCircle className="me-2" />
                    Chi tiết Lượt khám
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="checkup-detail-modal-body">
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" /> <p className="mt-2">Đang tải dữ liệu...</p></div>
                ) : !checkup ? (
                    <Alert variant="warning">Không tìm thấy thông tin chi tiết.</Alert>
                ) : (
                    <>
                        <Card className="mb-3 detail-card">
                            <Card.Header><FaUser className="me-2" />Thông tin chung</Card.Header>
                            <ListGroup variant="flush">
                                <DetailItem icon={<FaUser />} label="Học sinh" value={checkup.studentName} />
                                <DetailItem icon={<FaBuilding />} label="Lớp" value={checkup.studentClass} />
                                <DetailItem icon={<FaClipboardList />} label="Chiến dịch" value={checkup.campaignTitle} />
                                <DetailItem icon={<FaCalendarAlt />} label="Ngày khám" value={formatDate(checkup.checkupDate)} />
                                <DetailItem icon={<FaUserMd />} label="Nhân viên y tế" value={checkup.medicalStaffName} />
                            </ListGroup>
                        </Card>
                        <Row>
                            <Col md={8}>
                                <Card className="mb-3 detail-card">
                                    <Card.Header><FaStethoscope className="me-2" />Các chỉ số sức khỏe</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <DetailItem icon={<FaRulerVertical />} label="Chiều cao" value={`${checkup.height || 'N/A'} cm`} />
                                                <DetailItem icon={<FaWeight />} label="Cân nặng" value={`${checkup.weight || 'N/A'} kg`} />
                                                <DetailItem icon={<FaHeartbeat />} label="Huyết áp" value={checkup.bloodPressure} />
                                                <DetailItem icon={<FaHeartbeat />} label="Nhịp tim" value={`${checkup.heartRate || 'N/A'} bpm`} />
                                            </Col>
                                            <Col md={6}>
                                                <DetailItem icon={<FaEye />} label="Thị lực (Trái)" value={checkup.visionLeft} />
                                                <DetailItem icon={<FaEye />} label="Thị lực (Phải)" value={checkup.visionRight} />
                                                <DetailItem icon={<FaThermometerHalf />} label="Nhiệt độ" value={`${checkup.bodyTemperature || 'N/A'} °C`} />
                                                <DetailItem icon={<FaStethoscope />} label="Thính lực" value={checkup.hearingStatus || 'N/A'} />
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="mb-3 detail-card">
                                    <Card.Header><FaInfoCircle className="me-2" />Chỉ số BMI</Card.Header>
                                    <Card.Body className="text-center">
                                        <div className="fw-bold display-6">{checkup.bmi || 'N/A'}</div>
                                        <small className="text-muted">Body Mass Index</small>
                                    </Card.Body>
                                </Card>
                                <Card className="mb-3 detail-card">
                                    <Card.Header><FaClipboardList className="me-2" />Trạng thái</Card.Header>
                                    <Card.Body className="text-center">
                                        <div className="mb-3">
                                            <div className="fw-bold mb-2">Trạng thái khám</div>
                                            {renderStatusBadge(checkup.checkupStatus)}
                                        </div>
                                        <div>
                                            <div className="fw-bold mb-2">Thông báo P.Huynh</div>
                                            {renderParentNotifiedBadge(checkup.parentNotified)}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Card className="detail-card">
                            <Card.Header><FaNotesMedical className="me-2" />Chẩn đoán & Đề nghị</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <h6 className="card-subtitle mb-3 text-muted">Chẩn đoán của bác sĩ</h6>
                                        <p className="card-text">{checkup.diagnosis || 'Chưa có chẩn đoán.'}</p>
                                    </Col>
                                    <Col md={6}>
                                        <h6 className="card-subtitle mb-3 text-muted">Đề nghị của bác sĩ</h6>
                                        <p className="card-text">{checkup.notes || checkup.recommendations || 'Chưa có đề nghị.'}</p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default CheckupDetailModal;
