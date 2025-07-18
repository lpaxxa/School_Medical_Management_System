import React from 'react';
import { Modal, Row, Col, Badge, Spinner, Alert, Card, ListGroup } from 'react-bootstrap';
import { 
    FaUser, FaBuilding, FaCalendarAlt, FaStethoscope, FaClipboardList, FaInfoCircle,
    FaRulerVertical, FaWeight, FaHeartbeat, FaThermometerHalf, FaEye, FaNotesMedical, FaUserMd
} from 'react-icons/fa';

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
        <ListGroup.Item className="d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
                <div className="fw-bold">
                    {React.cloneElement(icon, { className: 'me-2 text-primary' })}
                    {label}
                </div>
                {value || 'N/A'}
            </div>
        </ListGroup.Item>
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
                            <Row>
                                    <Col md={6}><DetailItem icon={<FaUser />} label="Học sinh" value={checkup.studentName} /></Col>
                                    <Col md={6}><DetailItem icon={<FaBuilding />} label="Lớp" value={checkup.studentClass} /></Col>
                                    <Col md={6}><DetailItem icon={<FaClipboardList />} label="Chiến dịch" value={checkup.campaignTitle} /></Col>
                                    <Col md={6}><DetailItem icon={<FaCalendarAlt />} label="Ngày khám" value={formatDate(checkup.checkupDate)} /></Col>
                                    <Col md={6}><DetailItem icon={<FaUserMd />} label="Nhân viên y tế" value={checkup.medicalStaffName} /></Col>
                            </Row>
                            </ListGroup>
                        </Card>
                            <Row>
                            <Col md={7}>
                                <Card className="mb-3 detail-card">
                                    <Card.Header><FaStethoscope className="me-2" />Các chỉ số chính</Card.Header>
                                    <ListGroup variant="flush">
                                        <DetailItem icon={<FaRulerVertical />} label="Chiều cao" value={`${checkup.height || 'N/A'} cm`} />
                                        <DetailItem icon={<FaWeight />} label="Cân nặng" value={`${checkup.weight || 'N/A'} kg`} />
                                        <DetailItem icon={<FaHeartbeat />} label="Huyết áp" value={checkup.bloodPressure} />
                                        <DetailItem icon={<FaEye />} label="Thị lực (Trái)" value={checkup.visionLeft} />
                                        <DetailItem icon={<FaEye />} label="Thị lực (Phải)" value={checkup.visionRight} />
                                        <DetailItem icon={<FaHeartbeat />} label="Nhịp tim" value={`${checkup.heartRate || 'N/A'} bpm`} />
                                        <DetailItem icon={<FaThermometerHalf />} label="Nhiệt độ" value={`${checkup.bodyTemperature || 'N/A'} °C`} />
                                    </ListGroup>
                                </Card>
                            </Col>
                            <Col md={5}>
                                <Card className="mb-3 detail-card">
                                    <Card.Header><FaClipboardList className="me-2" />Kết quả & Trạng thái</Card.Header>
                                    <Card.Body className="text-center">
                                        <div className="mb-3">
                                            <div className="fw-bold mb-1">Trạng thái khám</div>
                                            {renderStatusBadge(checkup.checkupStatus)}
                                        </div>
                                        <div>
                                            <div className="fw-bold mb-1">Thông báo P.Huynh</div>
                                            {renderParentNotifiedBadge(checkup.parentNotified)}
                        </div>
                                    </Card.Body>
                                </Card>
                                <Card className="mb-3 detail-card">
                                     <Card.Header><FaInfoCircle className="me-2" />Chỉ số BMI</Card.Header>
                                     <Card.Body className="text-center">
                                        <div className="fw-bold display-6">{checkup.bmi || 'N/A'}</div>
                                     </Card.Body>
                                </Card>
                            </Col>
                            </Row>
                        <Card className="detail-card">
                            <Card.Header><FaNotesMedical className="me-2" />Chẩn đoán & Đề nghị</Card.Header>
                            <Card.Body>
                                <h6 className="card-subtitle mb-2 text-muted">Chẩn đoán của bác sĩ</h6>
                                <p className="card-text">{checkup.diagnosis || 'Chưa có chẩn đoán.'}</p>
                        <hr />
                                <h6 className="card-subtitle mb-2 mt-3 text-muted">Đề nghị của bác sĩ</h6>
                                <p className="card-text">{checkup.recommendations || 'Chưa có đề nghị.'}</p>
                            </Card.Body>
                        </Card>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default CheckupDetailModal;
