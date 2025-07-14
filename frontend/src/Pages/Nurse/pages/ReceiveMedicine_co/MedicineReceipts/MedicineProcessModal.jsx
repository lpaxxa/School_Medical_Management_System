import React from 'react';
import {
  Modal,
  Button,
  Form
} from 'react-bootstrap';
import './MedicineProcessModal.css';

const MedicineProcessModal = ({
  show,
  onHide,
  processData,
  onChange,
  onConfirm
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      className="medicine-process-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-clipboard-check me-2"></i>
          Xử lý yêu cầu thuốc
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Decision Info Banner */}
        {processData.decision === "APPROVED" && (
          <div className="decision-approve">
            <i className="fas fa-check-circle text-success me-2"></i>
            <strong>Phê duyệt yêu cầu:</strong> Đơn thuốc sẽ được chấp thuận và có thể tiến hành cung cấp thuốc cho học sinh.
          </div>
        )}
        
        {processData.decision === "REJECTED" && (
          <div className="decision-reject">
            <i className="fas fa-times-circle text-danger me-2"></i>
            <strong>Từ chối yêu cầu:</strong> Đơn thuốc sẽ bị từ chối. Vui lòng nhập lý do cụ thể bên dưới.
          </div>
        )}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="fas fa-gavel me-1"></i>
              Quyết định xử lý:
            </Form.Label>
            <Form.Select
              name="decision"
              value={processData.decision}
              onChange={onChange}
              className="form-select"
            >
              <option value="APPROVED">✅ Phê duyệt - Chấp thuận đơn thuốc</option>
              <option value="REJECTED">❌ Từ chối - Không chấp thuận đơn thuốc</option>
            </Form.Select>
            <div className="form-text text-muted mt-2">
              Chọn quyết định phù hợp sau khi đánh giá đơn thuốc
            </div>
          </Form.Group>

          {processData.decision === "REJECTED" && (
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="fas fa-comment-alt me-1"></i>
                Lý do từ chối: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="reason"
                placeholder="Nhập lý do cụ thể tại sao từ chối yêu cầu thuốc này (ví dụ: thiếu thông tin, thuốc không phù hợp, vượt quá liều lượng cho phép, v.v.)"
                value={processData.reason}
                onChange={onChange}
                required={processData.decision === "REJECTED"}
                className="form-control"
              />
              <div className="form-text text-muted mt-2">
                Lý do từ chối sẽ được gửi thông báo đến phụ huynh/người yêu cầu
              </div>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <i className="fas fa-times me-2"></i>
          Hủy bỏ
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          <i className="fas fa-check me-2"></i>
          {processData.decision === "APPROVED" ? "Phê duyệt" : "Từ chối"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MedicineProcessModal;
