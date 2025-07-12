import React, { useState } from 'react';
import { FaCamera, FaTrash, FaSpinner, FaTimes, FaImage } from 'react-icons/fa';
import './StudentImageUpload.css';

// Default placeholder image as data URI
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMCAxMjBDMzAgMTA0IDUwIDkwIDc1IDkwUzEyMCAxMDQgMTIwIDEyMFYxMzBIMzBWMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';

const StudentImageUpload = ({ 
  student, 
  onImageUpload, 
  onImageDelete, 
  disabled = false 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');

  // File validation
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Chỉ chấp nhận file JPG, PNG hoặc GIF';
    }

    if (file.size > maxSize) {
      return 'Kích thước file không được vượt quá 5MB';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowModal(true);
  };

  // Handle upload - using existing StudentController endpoint
  const handleUpload = async () => {
    if (!selectedFile || !student.id) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/students/${student.id}/upload-image`,
        {
          method: 'POST',
          // No Authorization header needed - endpoint is permitAll due to authentication issues
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.imageUrl) {
        onImageUpload(student.id, result.imageUrl);
        setShowModal(false);
        resetModal();
      } else {
        setError(result.error || 'Có lỗi xảy ra khi tải ảnh lên');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete - for now just clear the image URL
  const handleDelete = async () => {
    if (!student.id || !student.imageUrl) return;

    setIsDeleting(true);
    
    try {
      // For now, just clear the image URL locally
      // In a full implementation, you would call a backend delete endpoint
      onImageDelete(student.id);
      setError('');
    } catch (error) {
      console.error('Delete error:', error);
      setError('Có lỗi xảy ra khi xóa ảnh');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset modal state
  const resetModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    resetModal();
  };

  return (
    <>
      <div className="student-image-upload">
        <div className="image-container">
          {student.imageUrl ? (
            <div className="image-wrapper">
              <img 
                src={student.imageUrl} 
                alt={`Ảnh của ${student.fullName}`}
                className="student-image"
                onError={(e) => {
                  e.target.src = DEFAULT_PLACEHOLDER;
                  e.target.onerror = null; // Prevent infinite loop
                }}
              />
              {!disabled && (
                <div className="image-overlay">
                  <button
                    type="button"
                    className="image-action-btn upload-btn"
                    onClick={() => document.getElementById(`file-input-${student.id}`).click()}
                    disabled={isUploading || isDeleting}
                    title="Thay đổi ảnh"
                  >
                    <FaCamera />
                  </button>
                  <button
                    type="button"
                    className="image-action-btn delete-btn"
                    onClick={handleDelete}
                    disabled={isUploading || isDeleting}
                    title="Xóa ảnh"
                  >
                    {isDeleting ? <FaSpinner className="spinning" /> : <FaTrash />}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="no-image">
              <FaImage />
              <span>Chưa có ảnh</span>
              {!disabled && (
                <button
                  type="button"
                  className="upload-image-btn"
                  onClick={() => document.getElementById(`file-input-${student.id}`).click()}
                  disabled={isUploading || isDeleting}
                >
                  <FaCamera />
                  Thêm ảnh
                </button>
              )}
            </div>
          )}
        </div>

        {!disabled && (
          <input
            id={`file-input-${student.id}`}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        )}

        {error && (
          <div className="upload-error">
            {error}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="image-upload-modal-overlay">
          <div className="image-upload-modal-dialog">
            <div className="modal-header">
              <h3>Tải ảnh lên cho {student.fullName}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}

              <div className="file-info">
                <p><strong>File:</strong> {selectedFile?.name}</p>
                <p><strong>Kích thước:</strong> {selectedFile ? Math.round(selectedFile.size / 1024) + ' KB' : ''}</p>
              </div>

              {error && (
                <div className="upload-error">
                  {error}
                </div>
              )}

              <div className="upload-note">
                <p>Lưu ý:</p>
                <ul>
                  <li>Chỉ chấp nhận file JPG, PNG, GIF</li>
                  <li>Kích thước tối đa: 5MB</li>
                  <li>Ảnh sẽ được tự động cắt và tối ưu hóa</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={closeModal}
                disabled={isUploading}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-upload"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="spinning" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <FaCamera />
                    Tải ảnh lên
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentImageUpload; 