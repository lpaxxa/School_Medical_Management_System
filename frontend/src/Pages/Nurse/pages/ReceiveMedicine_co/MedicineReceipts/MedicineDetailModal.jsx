import React from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  Card
} from 'react-bootstrap';
import {
  FaPlus,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import './MedicineDetailModal.css';

const MedicineDetailModal = ({
  show,
  onHide,
  selectedReceipt,
  getStatusInfo,
  canRecordAdministration,
  onRecordAdministration,
  onProcessClick
}) => {
  if (!selectedReceipt) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered 
      className="medicine-receipts-detail-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-pills me-2"></i>
          Chi tiết đơn nhận thuốc #{selectedReceipt?.id}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Status Info Banner */}
        <div className="info-highlight">
          <i className="fas fa-info-circle"></i>
          <strong>Trạng thái hiện tại:</strong>
          <span className="status-badge" style={{
            backgroundColor: getStatusInfo(selectedReceipt?.status).color,
            color: getStatusInfo(selectedReceipt?.status).textColor,
            marginLeft: '10px'
          }}>
            {getStatusInfo(selectedReceipt?.status).text}
          </span>
        </div>

        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <i className="fas fa-prescription-bottle me-2"></i>
                Thông tin cơ bản
              </Card.Header>
              <Card.Body>
                <p><strong>Mã đơn:</strong> #{selectedReceipt?.id}</p>
                <p><strong>Tên thuốc:</strong> {selectedReceipt?.medicationName || "Không có thông tin"}</p>
                <p><strong>Liều lượng:</strong> {selectedReceipt?.dosageInstructions || "Không có thông tin"}</p>
                <p><strong>Tần suất:</strong> {selectedReceipt?.frequencyPerDay ? `${selectedReceipt.frequencyPerDay} lần/ngày` : "Không có thông tin"}</p>
                <p><strong>Ngày bắt đầu:</strong> {selectedReceipt?.startDate ? new Date(selectedReceipt.startDate).toLocaleDateString("vi-VN") : "Không có thông tin"}</p>
                <p><strong>Ngày kết thúc:</strong> {selectedReceipt?.endDate ? new Date(selectedReceipt.endDate).toLocaleDateString("vi-VN") : "Không có thông tin"}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <i className="fas fa-user-graduate me-2"></i>
                Thông tin học sinh
              </Card.Header>
              <Card.Body>
                <p><strong>Học sinh:</strong> {selectedReceipt?.studentName || "Không có thông tin"}</p>
                <p><strong>Mã học sinh:</strong> {selectedReceipt?.studentId || "Không có thông tin"}</p>
                <p><strong>Người yêu cầu:</strong> {selectedReceipt?.requestedBy || "Không có thông tin"}</p>
                <p><strong>Mã tài khoản:</strong> {selectedReceipt?.requestedByAccountId || "Không có thông tin"}</p>
                <p><strong>Ngày yêu cầu:</strong> {selectedReceipt?.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString("vi-VN") : "Không có thông tin"}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {selectedReceipt?.specialInstructions && (
          <Card className="mb-3 special-instructions-card">
            <Card.Header>
              <i className="fas fa-exclamation-triangle me-2"></i>
              Hướng dẫn đặc biệt
            </Card.Header>
            <Card.Body>
              <p style={{ fontStyle: 'italic', fontSize: '1rem', lineHeight: '1.6' }}>
                "{selectedReceipt.specialInstructions}"
              </p>
            </Card.Body>
          </Card>
        )}
        
        {selectedReceipt?.rejectionReason && (
          <Card className="mb-3 border-danger">
            <Card.Header className="bg-danger text-white">
              <i className="fas fa-times-circle me-2"></i>
              Lý do từ chối
            </Card.Header>
            <Card.Body>
              <p className="text-danger" style={{ fontSize: '1rem', fontWeight: '500' }}>
                {selectedReceipt.rejectionReason}
              </p>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
        
        {canRecordAdministration(selectedReceipt?.status, selectedReceipt) && (
          <Button 
            variant="success"
            onClick={() => {
              onHide();
              onRecordAdministration(selectedReceipt);
            }}
          >
            <FaPlus className="me-2" /> 
            {selectedReceipt?.status === "PARTIALLY_TAKEN" ? "Tiếp tục ghi nhận" : "Ghi nhận cung cấp"}
          </Button>
        )}
        
        {(selectedReceipt?.status === "PENDING_APPROVAL" || selectedReceipt?.status === 0) && (
          <>
            <Button 
              variant="success"
              onClick={() => {
                onHide();
                onProcessClick(selectedReceipt.id, "APPROVED");
              }}
            >
              <FaCheckCircle className="me-2" /> Phê duyệt
            </Button>
            <Button 
              variant="danger"
              onClick={() => {
                onHide();
                onProcessClick(selectedReceipt.id, "REJECTED");
              }}
            >
              <FaTimesCircle className="me-2" /> Từ chối
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default MedicineDetailModal;
