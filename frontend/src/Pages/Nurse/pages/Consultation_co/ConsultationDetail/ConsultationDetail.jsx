import React, { useState, useEffect } from 'react';
import { markConsultationAsRead, addConsultationResponse } from '../../../../../services/APINurse/consultationService';
import './ConsultationDetail.css';

const ConsultationDetail = ({ consultation, onBack, onConsultationUpdated }) => {
  const [consultationData, setConsultationData] = useState(consultation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseContent, setResponseContent] = useState('');
  const [sending, setSending] = useState(false);

  // Mark consultation as read when opened
  useEffect(() => {
    const markAsRead = async () => {
      if (!consultationData.isRead) {
        try {
          const updatedConsultation = await markConsultationAsRead(consultationData.id);
          setConsultationData(updatedConsultation);
        } catch (err) {
          console.error("Error marking consultation as read:", err);
          // Not showing error to user for this operation
        }
      }
    };
    
    markAsRead();
  }, [consultationData.id, consultationData.isRead]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Check if consultation is urgent (deadline within 2 days)
  const isUrgent = () => {
    if (!consultationData.responseDeadline || consultationData.responses.length > 0) return false;
    
    const now = new Date();
    const deadline = new Date(consultationData.responseDeadline);
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);
    
    return deadline <= twoDaysFromNow && deadline >= now;
  };

  // Check if consultation is overdue
  const isOverdue = () => {
    if (!consultationData.responseDeadline || consultationData.responses.length > 0) return false;
    
    const now = new Date();
    const deadline = new Date(consultationData.responseDeadline);
    
    return deadline < now;
  };

  // Get status badge class
  const getStatusBadgeClass = () => {
    if (consultationData.responses.length > 0) return "status-replied";
    if (isOverdue()) return "status-overdue";
    if (isUrgent()) return "status-urgent";
    if (consultationData.isRead) return "status-read";
    return "status-unread";
  };

  // Get status text
  const getStatusText = () => {
    if (consultationData.responses.length > 0) return "Đã phản hồi";
    if (isOverdue()) return "Quá hạn phản hồi";
    if (isUrgent()) return "Cần phản hồi gấp";
    if (consultationData.isRead) return "Đã đọc";
    return "Chưa đọc";
  };

  // Handle form submission for adding a response
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseContent.trim()) {
      setError("Vui lòng nhập nội dung phản hồi");
      return;
    }
    
    try {
      setSending(true);
      setError(null);
      
      // Mock current user (in a real app, this would come from auth context)
      const currentUser = {
        id: "u003",
        name: "Đỗ Thị Hoa",
        role: "Y tá"
      };
      
      const responseData = {
        responder: currentUser,
        content: responseContent
      };
      
      const updatedConsultation = await addConsultationResponse(consultationData.id, responseData);
      setConsultationData(updatedConsultation);
      setResponseContent('');
      onConsultationUpdated(updatedConsultation);
    } catch (err) {
      console.error("Error sending response:", err);
      setError("Không thể gửi phản hồi. Vui lòng thử lại sau.");
    } finally {
      setSending(false);
    }
  };

  if (!consultationData) {
    return (
      <div className="consultation-detail">
        <div className="detail-header">
          <button className="back-button" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
        </div>
        <div className="detail-content">
          <p>Không tìm thấy thông tin tư vấn yêu cầu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-detail">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        <span className={`status-badge ${getStatusBadgeClass()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="detail-content">
        <div className="detail-title-section">
          <h2>{consultationData.title}</h2>
          <div className="detail-meta">
            <div className="meta-item">
              <i className="fas fa-clipboard-list"></i>
              <span>{consultationData.type?.name || 'Tư vấn'}</span>
            </div>
            <div className="meta-item">
              <i className="far fa-calendar-alt"></i>
              <span>Tạo ngày {formatDate(consultationData.createdAt)}</span>
            </div>
            {consultationData.responseDeadline && (
              <div className={`meta-item ${isUrgent() ? 'urgent' : ''} ${isOverdue() ? 'overdue' : ''}`}>
                <i className="fas fa-hourglass-half"></i>
                <span>Hạn phản hồi: {formatDate(consultationData.responseDeadline)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-info-grid">
          <div className="info-section">
            <h3>Người gửi</h3>
            <div className="info-content">
              <p><strong>Họ tên:</strong> {consultationData.sender?.name || 'N/A'}</p>
              <p><strong>Chức vụ:</strong> {consultationData.sender?.role || 'N/A'}</p>
            </div>
          </div>

          <div className="info-section">
            <h3>Người nhận</h3>
            <div className="info-content">
              <p><strong>Họ tên:</strong> {consultationData.receiver?.name || 'N/A'}</p>
              <p><strong>Chức vụ:</strong> {consultationData.receiver?.role || 'N/A'}</p>
            </div>
          </div>
          
          {consultationData.student && (
            <div className="info-section wide">
              <h3>Học sinh liên quan</h3>
              <div className="info-content">
                <p><strong>Họ tên:</strong> {consultationData.student.name}</p>
                <p><strong>Lớp:</strong> {consultationData.student.class}</p>
                <p><strong>Mã học sinh:</strong> {consultationData.student.id}</p>
              </div>
            </div>
          )}
        </div>

        <div className="consultation-message">
          <h3>Nội dung tư vấn</h3>
          <div className="message-content">
            {consultationData.content}
          </div>
        </div>

        <div className="consultation-responses">
          <h3>
            Phản hồi
            {consultationData.responses.length > 0 && (
              <span className="response-count">({consultationData.responses.length})</span>
            )}
          </h3>
          
          {consultationData.responses.length === 0 ? (
            <div className="no-responses">
              <p>Chưa có phản hồi nào.</p>
            </div>
          ) : (
            <div className="response-list">
              {consultationData.responses.map((response, index) => (
                <div key={index} className="response-item">
                  <div className="response-header">
                    <div className="response-user">
                      <div className="response-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="response-user-info">
                        <h4>{response.responder?.name}</h4>
                        <span>{response.responder?.role}</span>
                      </div>
                    </div>
                    <div className="response-time">
                      {formatDate(response.createdAt)}
                    </div>
                  </div>
                  <div className="response-content">
                    {response.content}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="response-form">
            <h4>Gửi phản hồi</h4>
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <textarea
                  className="form-control form-textarea"
                  placeholder="Nhập nội dung phản hồi..."
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  disabled={sending}
                  rows={6}
                ></textarea>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || !responseContent.trim()}
                >
                  {sending ? 'Đang gửi...' : 'Gửi phản hồi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetail;
