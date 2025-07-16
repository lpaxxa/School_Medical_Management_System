import React from 'react';
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  Alert
} from 'react-bootstrap';
import { FaCamera, FaUpload, FaTimes, FaCheck } from 'react-icons/fa';
import './MedicineAdministrationModal.css';

const MedicineAdministrationModal = ({
  show,
  onHide,
  selectedRequest,
  formData,
  onInputChange,
  onSubmit,
  loading,
  selectedImage,
  imagePreview,
  onImageSelect,
  getCurrentDateTime,
  getMinDateTime,
  getMaxDateTime
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered 
      className="medicine-administration-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-pills me-2"></i>
          Ghi nhận cung cấp thuốc
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Request Info Banner */}
        {selectedRequest && (
          <Alert variant="info" className="medicine-admin-info-banner">
            <Row>
              <Col md={6}>
                <strong>Yêu cầu:</strong> #{selectedRequest.id} - {selectedRequest.studentName}
              </Col>
              <Col md={6}>
                <strong>Thuốc:</strong> {selectedRequest.medicationName || "Không có thông tin"}
              </Col>
            </Row>
          </Alert>
        )}

        <Form onSubmit={onSubmit} id="medicine-admin-form">
          <Row>
            <Col md={6}>
              <Card className="mb-3 medicine-admin-time-card">
                <Card.Header>
                  <i className="fas fa-clock me-2"></i>
                  Thời gian thực hiện
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-calendar-alt me-1"></i>
                      Thời gian thực hiện: <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="administeredAt"
                      value={formData.administeredAt}
                      onChange={onInputChange}
                      min={getMinDateTime ? getMinDateTime() : ''}
                      max={getMaxDateTime ? getMaxDateTime() : getCurrentDateTime()}
                      required
                      className="medicine-admin-datetime-input"
                    />
                    <div className="form-text text-muted mt-2">
                      <i className="fas fa-info-circle me-1"></i>
                      Thời gian thực tế đã cho thuốc. Trạng thái sẽ được tự động cập nhật dựa trên số lần đã cho thuốc.
                    </div>
                    {selectedRequest?.startDate && (
                      <div className="form-text text-success mt-1">
                        <i className="fas fa-calendar-check me-1"></i>
                        Không được trước ngày: {new Date(selectedRequest.startDate).toLocaleDateString("vi-VN")}
                      </div>
                    )}
                    {selectedRequest?.endDate && (
                      <div className="form-text text-warning mt-1">
                        <i className="fas fa-calendar-times me-1"></i>
                        Không được sau ngày: {new Date(selectedRequest.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3 medicine-admin-photo-card">
                <Card.Header>
                  <i className="fas fa-camera me-2"></i>
                  Ảnh xác nhận
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaCamera className="me-1" />
                      Chọn tệp ảnh (tùy chọn):
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={onImageSelect}
                      className="medicine-admin-file-input"
                    />
                    <div className="form-text text-muted mt-2">
                      <i className="fas fa-info-circle me-1"></i>
                      Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF
                    </div>
                  </Form.Group>

                  {imagePreview && (
                    <div className="medicine-admin-image-preview position-relative">
                      <img
                        src={imagePreview}
                        alt="Ảnh xác nhận"
                        className="img-fluid rounded shadow-sm"
                        style={{ maxHeight: '150px', width: '100%', objectFit: 'cover' }}
                      />
                      {/* Nút X để xóa ảnh */}
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-1 rounded-circle"
                        style={{
                          width: '30px',
                          height: '30px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}
                        onClick={() => {
                          // Reset image states
                          onImageSelect(null);
                        }}
                        title="Xóa ảnh"
                      >
                        <FaTimes />
                      </Button>
                      <div className="text-center mt-2">
                        <small className="text-success">
                          <FaCheck className="me-1" />
                          Đã chọn ảnh
                        </small>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mb-3 medicine-admin-notes-card">
            <Card.Header>
              <i className="fas fa-sticky-note me-2"></i>
              Ghi chú
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-comment-alt me-1"></i>
                  Ghi chú về việc cung cấp thuốc (ví dụ: phản ứng của học sinh, liều lượng thực tế đã cho, bất kỳ vấn đề gì xảy ra...):
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="notes"
                  placeholder="Nhập ghi chú về việc cung cấp thuốc (ví dụ: phản ứng của học sinh, liều lượng thực tế đã cho, bất kỳ vấn đề gì xảy ra...)"
                  value={formData.notes}
                  onChange={onInputChange}
                  className="medicine-admin-notes-textarea"
                />
                <div className="form-text text-muted mt-2">
                  <i className="fas fa-info-circle me-1"></i>
                  Ghi chú sẽ được lưu trong lịch sử và có thể được phụ huynh xem
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        </Form>
      </Modal.Body>

      <Modal.Footer className="medicine-admin-footer">
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={loading}
          type="button"
          className="medicine-admin-cancel-btn"
        >
          <FaTimes className="me-2" />
          Hủy bỏ
        </Button>
        <Button 
          variant="success" 
          type="submit"
          form="medicine-admin-form"
          disabled={loading || !formData.administeredAt}
          className="medicine-admin-submit-btn"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin me-2"></i>
              Đang xử lý...
            </>
          ) : (
            <>
              <FaCheck className="me-2" />
              Ghi nhận cung cấp
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MedicineAdministrationModal;
