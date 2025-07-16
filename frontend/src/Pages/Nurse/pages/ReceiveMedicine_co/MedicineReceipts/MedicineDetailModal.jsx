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

  // Helper function to format date from backend
  const formatDate = (dateInput) => {
    if (!dateInput) return "Không có thông tin";

    try {
      let date;

      // Debug log to see what we're receiving
      console.log('formatDate input:', dateInput, 'type:', typeof dateInput, 'isArray:', Array.isArray(dateInput));

      // Handle array format from backend [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateInput)) {
        if (dateInput.length >= 3) {
          // Month is 0-indexed in JavaScript Date constructor
          const year = dateInput[0];
          const month = dateInput[1] - 1; // Convert to 0-indexed
          const day = dateInput[2];
          const hour = dateInput[3] || 0;
          const minute = dateInput[4] || 0;
          const second = dateInput[5] || 0;
          const nanosecond = dateInput[6] || 0;
          // Convert nanoseconds to milliseconds for JavaScript Date
          const millisecond = Math.floor(nanosecond / 1000000);

          console.log('Creating date with:', { year, month, day, hour, minute, second, millisecond });
          date = new Date(year, month, day, hour, minute, second, millisecond);
        } else {
          console.log('Array too short:', dateInput.length);
          return 'Ngày không hợp lệ';
        }
      }
      // Handle string format
      else if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      }
      // Handle Date object
      else if (dateInput instanceof Date) {
        date = dateInput;
      }
      else {
        console.log('Unknown date format:', typeof dateInput);
        return 'Ngày không hợp lệ';
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date created:', date);
        return 'Ngày không hợp lệ';
      }

      const result = date.toLocaleDateString('vi-VN');
      console.log('Final formatted date:', result);
      return result;
    } catch (error) {
      console.error('Error formatting date:', error, dateInput);
      return 'Ngày không hợp lệ';
    }
  };

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
                <p><strong>Ngày bắt đầu:</strong> {formatDate(selectedReceipt?.startDate)}</p>
                <p><strong>Ngày kết thúc:</strong> {formatDate(selectedReceipt?.endDate)}</p>
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
                <p><strong>Ngày yêu cầu:</strong> {formatDate(selectedReceipt?.submittedAt || selectedReceipt?.createdAt)}</p>
                {selectedReceipt?.responseDate && (
                  <p><strong>Ngày phê duyệt:</strong> {formatDate(selectedReceipt?.responseDate)}</p>
                )}
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
