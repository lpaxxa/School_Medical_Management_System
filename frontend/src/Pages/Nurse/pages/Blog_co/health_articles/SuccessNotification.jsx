import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';

const SuccessNotification = ({ 
  show, 
  onHide, 
  title = "Thành công!", 
  message = "Thao tác đã được thực hiện thành công.",
  autoHideDelay = 3000,
  iconType = "check" // check, edit, delete, add
}) => {
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(autoHideDelay / 1000);

  useEffect(() => {
    if (show) {
      setProgress(100);
      setTimeLeft(autoHideDelay / 1000);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (autoHideDelay / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            onHide();
            return 0;
          }
          return newProgress;
        });
        
        setTimeLeft(prev => {
          const newTime = prev - 0.1;
          return newTime > 0 ? newTime : 0;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [show, autoHideDelay, onHide]);

  const getIcon = () => {
    switch (iconType) {
      case 'edit':
        return 'fas fa-edit';
      case 'delete':
        return 'fas fa-trash-alt';
      case 'add':
        return 'fas fa-plus';
      case 'publish':
        return 'fas fa-globe';
      case 'unpublish':
        return 'fas fa-eye-slash';
      case 'favorite':
        return 'fas fa-heart';
      default:
        return 'fas fa-check';
    }
  };

  const getTitle = () => {
    if (title !== "Thành công!") return title;
    
    switch (iconType) {
      case 'edit':
        return 'Cập nhật bài viết y tế thành công!';
      case 'delete':
        return 'Xóa bài viết y tế thành công!';
      case 'add':
        return 'Thêm bài viết y tế thành công!';
      case 'publish':
        return 'Xuất bản bài viết thành công!';
      case 'unpublish':
        return 'Hủy xuất bản bài viết thành công!';
      case 'favorite':
        return 'Đã thêm vào yêu thích!';
      default:
        return 'Thành công!';
    }
  };

  const getMessage = () => {
    if (message !== "Thao tác đã được thực hiện thành công.") return message;
    
    switch (iconType) {
      case 'edit':
        return 'Bài viết y tế đã được cập nhật thành công. Thông tin mới sẽ được hiển thị ngay lập tức.';
      case 'delete':
        return 'Bài viết y tế đã được xóa khỏi hệ thống. Bạn sẽ được chuyển về danh sách bài viết.';
      case 'add':
        return 'Bài viết y tế mới đã được thêm thành công. Bạn sẽ được chuyển về danh sách bài viết.';
      case 'publish':
        return 'Bài viết y tế đã được xuất bản và có thể được cộng đồng xem.';
      case 'unpublish':
        return 'Bài viết y tế đã được ẩn khỏi cộng đồng và chuyển về trạng thái nháp.';
      case 'favorite':
        return 'Bài viết y tế đã được thêm vào danh sách yêu thích của bạn.';
      default:
        return 'Thao tác đã được thực hiện thành công.';
    }
  };

  return (
    <>
      <style>
        {`
          .health-article-success-notification-modal .modal-dialog {
            max-width: 450px !important;
            margin: 1.75rem auto !important;
          }
          
          .health-article-success-notification-content {
            background: white !important;
            border-radius: 1rem !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
            border: none !important;
            overflow: hidden !important;
            position: relative !important;
          }
          
          .health-article-success-notification-close {
            position: absolute !important;
            top: 1rem !important;
            right: 1rem !important;
            background: transparent !important;
            border: none !important;
            font-size: 1.2rem !important;
            color: #6c757d !important;
            cursor: pointer !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.3s ease !important;
            z-index: 10 !important;
          }
          
          .health-article-success-notification-close:hover {
            background: #f8f9fa !important;
            color: #495057 !important;
            transform: scale(1.1) !important;
          }
          
          .health-article-success-notification-body {
            padding: 2.5rem 2rem 1.5rem 2rem !important;
            text-align: center !important;
          }
          
          .health-article-success-notification-icon {
            width: 80px !important;
            height: 80px !important;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
            border-radius: 50% !important;
            margin: 0 auto 1.5rem auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3) !important;
            animation: healthArticleSuccessIconPulse 0.6s ease-out !important;
          }
          
          .health-article-success-notification-icon i {
            font-size: 2.5rem !important;
            color: white !important;
          }
          
          .health-article-success-notification-title {
            color: #2d3436 !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            margin-bottom: 0.75rem !important;
            animation: healthArticleSuccessTitleSlide 0.8s ease-out 0.2s both !important;
          }
          
          .health-article-success-notification-message {
            color: #636e72 !important;
            font-size: 1rem !important;
            line-height: 1.5 !important;
            margin-bottom: 0 !important;
            animation: healthArticleSuccessMessageSlide 0.8s ease-out 0.4s both !important;
          }
          
          .health-article-success-notification-progress-container {
            position: relative !important;
            height: 4px !important;
            background: #e9ecef !important;
            overflow: hidden !important;
          }
          
          .health-article-success-notification-progress-bar {
            height: 100% !important;
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%) !important;
            transition: width 0.1s linear !important;
            position: relative !important;
          }
          
          .health-article-success-notification-progress-bar::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 10px !important;
            background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%) !important;
            animation: healthArticleProgressShimmer 1s ease-in-out infinite !important;
          }
          
          .health-article-success-notification-timer {
            padding: 0.75rem 1rem !important;
            background: #f8f9fa !important;
            color: #6c757d !important;
            font-size: 0.875rem !important;
            text-align: center !important;
            font-weight: 500 !important;
          }
          
          @keyframes healthArticleSuccessIconPulse {
            0% {
              transform: scale(0) rotate(-180deg) !important;
              opacity: 0 !important;
            }
            50% {
              transform: scale(1.2) rotate(-90deg) !important;
              opacity: 0.8 !important;
            }
            100% {
              transform: scale(1) rotate(0deg) !important;
              opacity: 1 !important;
            }
          }
          
          @keyframes healthArticleSuccessTitleSlide {
            0% {
              opacity: 0 !important;
              transform: translateY(20px) !important;
            }
            100% {
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
          }
          
          @keyframes healthArticleSuccessMessageSlide {
            0% {
              opacity: 0 !important;
              transform: translateY(15px) !important;
            }
            100% {
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
          }
          
          @keyframes healthArticleProgressShimmer {
            0% {
              transform: translateX(-10px) !important;
            }
            100% {
              transform: translateX(10px) !important;
            }
          }
          
          /* Icon variations for health articles */
          .health-article-success-notification-icon.edit {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3) !important;
          }
          
          .health-article-success-notification-icon.delete {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
            box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3) !important;
          }
          
          .health-article-success-notification-icon.add {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3) !important;
          }
          
          .health-article-success-notification-icon.publish {
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%) !important;
            box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3) !important;
          }
          
          .health-article-success-notification-icon.unpublish {
            background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%) !important;
            box-shadow: 0 8px 25px rgba(108, 117, 125, 0.3) !important;
          }
          
          .health-article-success-notification-icon.favorite {
            background: linear-gradient(135deg, #e83e8c 0%, #d91a72 100%) !important;
            box-shadow: 0 8px 25px rgba(232, 62, 140, 0.3) !important;
          }
          
          /* Progress bar variations */
          .health-article-success-notification-progress-bar.edit {
            background: linear-gradient(90deg, #0d6efd 0%, #0b5ed7 100%) !important;
          }
          
          .health-article-success-notification-progress-bar.delete {
            background: linear-gradient(90deg, #dc3545 0%, #c82333 100%) !important;
          }
          
          .health-article-success-notification-progress-bar.add {
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%) !important;
          }
          
          .health-article-success-notification-progress-bar.publish {
            background: linear-gradient(90deg, #17a2b8 0%, #138496 100%) !important;
          }
          
          .health-article-success-notification-progress-bar.unpublish {
            background: linear-gradient(90deg, #6c757d 0%, #5a6268 100%) !important;
          }
          
          .health-article-success-notification-progress-bar.favorite {
            background: linear-gradient(90deg, #e83e8c 0%, #d91a72 100%) !important;
          }
          
          @media (max-width: 576px) {
            .health-article-success-notification-modal .modal-dialog {
              max-width: 350px !important;
              margin: 1rem auto !important;
            }
            
            .health-article-success-notification-body {
              padding: 2rem 1.5rem 1rem 1.5rem !important;
            }
            
            .health-article-success-notification-icon {
              width: 70px !important;
              height: 70px !important;
            }
            
            .health-article-success-notification-icon i {
              font-size: 2rem !important;
            }
            
            .health-article-success-notification-title {
              font-size: 1.3rem !important;
            }
            
            .health-article-success-notification-message {
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>
      
      <Modal
        show={show}
        onHide={onHide}
        centered
        backdrop="static"
        keyboard={false}
        className="health-article-success-notification-modal"
      >
        <div className="health-article-success-notification-content">
          <button 
            type="button" 
            className="health-article-success-notification-close"
            onClick={onHide}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
          
          <div className="health-article-success-notification-body">
            <div className={`health-article-success-notification-icon ${iconType}`}>
              <i className={getIcon()}></i>
            </div>
            
            <h4 className="health-article-success-notification-title">
              {getTitle()}
            </h4>
            
            <p className="health-article-success-notification-message">
              {getMessage()}
            </p>
          </div>
          
          {/* Progress bar đếm ngược */}
          <div className="health-article-success-notification-progress-container">
            <div 
              className={`health-article-success-notification-progress-bar ${iconType}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Hiển thị thời gian còn lại */}
          <div className="health-article-success-notification-timer">
            Tự động đóng sau {Math.ceil(timeLeft)} giây
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SuccessNotification;
