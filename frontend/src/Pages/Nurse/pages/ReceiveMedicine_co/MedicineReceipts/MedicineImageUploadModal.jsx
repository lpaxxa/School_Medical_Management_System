import React from 'react';
import {
  Modal,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import { FaUpload, FaTimes, FaCamera, FaCheck } from 'react-icons/fa';
import './MedicineImageUploadModal.css';

const MedicineImageUploadModal = ({
  show,
  onHide,
  onUpload,
  onSkip,
  selectedImage,
  imagePreview,
  uploadLoading,
  pendingAdministrationId
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      backdrop="static"
      className="medicine-image-upload-modal"
    >
      <Modal.Header>
        <Modal.Title>
          <FaCamera className="me-2" />
          Xác nhận ảnh cung cấp thuốc
        </Modal.Title>
        <Button
          variant="outline-secondary"
          size="sm"
          className="btn-close-custom"
          onClick={onHide}
          style={{
            position: 'absolute',
            right: '15px',
            top: '15px',
            border: 'none',
            background: 'transparent',
            fontSize: '18px',
            color: '#6c757d'
          }}
          title="Đóng modal"
        >
          <FaTimes />
        </Button>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="success" className="medicine-upload-success-banner">
          <div className="d-flex align-items-center">
            <FaCheck className="me-2 text-success" />
            <div>
              <strong>Đã ghi nhận thành công!</strong>
              <div className="mt-1">
                Mã bản ghi: <span className="fw-bold">#{pendingAdministrationId}</span>
              </div>
            </div>
          </div>
        </Alert>

        <div className="medicine-upload-content">
          <h6 className="medicine-upload-title">
            <FaUpload className="me-2" />
            Bạn có muốn tải lên ảnh xác nhận?
          </h6>
          
          <p className="medicine-upload-description">
            Ảnh xác nhận sẽ giúp phụ huynh yên tâm hơn về việc cung cấp thuốc cho con em mình.
            Bạn có thể bỏ qua bước này nếu không cần thiết.
          </p>

          {selectedImage && imagePreview && (
            <div className="medicine-upload-preview">
              <h6 className="medicine-upload-preview-title">
                <FaCamera className="me-2" />
                Ảnh đã chọn:
              </h6>
              <div className="medicine-upload-image-container">
                <img
                  src={imagePreview}
                  alt="Ảnh xác nhận cung cấp thuốc"
                  className="medicine-upload-preview-image"
                />
                <div className="medicine-upload-file-info">
                  <small className="text-muted">
                    <i className="fas fa-file-image me-1"></i>
                    {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                  </small>
                </div>
              </div>
            </div>
          )}

          {!selectedImage && (
            <Alert variant="info" className="medicine-upload-no-image">
              <i className="fas fa-info-circle me-2"></i>
              Không có ảnh nào được chọn. Bạn có thể quay lại modal trước để chọn ảnh.
            </Alert>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="medicine-upload-footer">
        <Button 
          variant="outline-secondary" 
          onClick={onSkip}
          disabled={uploadLoading}
          className="medicine-upload-skip-btn"
        >
          <FaTimes className="me-2" />
          Bỏ qua
        </Button>
        
        {selectedImage && (
          <Button 
            variant="primary" 
            onClick={onUpload}
            disabled={uploadLoading}
            className="medicine-upload-submit-btn"
          >
            {uploadLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Đang tải lên...
              </>
            ) : (
              <>
                <FaUpload className="me-2" />
                Tải lên ảnh
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default MedicineImageUploadModal;
