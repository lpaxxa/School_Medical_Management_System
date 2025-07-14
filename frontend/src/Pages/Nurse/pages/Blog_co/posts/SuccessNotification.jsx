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
      default:
        return 'fas fa-check';
    }
  };

  const getTitle = () => {
    if (title !== "Thành công!") return title;
    
    switch (iconType) {
      case 'edit':
        return 'Cập nhật bài viết thành công!';
      case 'delete':
        return 'Xóa bài viết thành công!';
      case 'add':
        return 'Thêm bài viết thành công!';
      default:
        return 'Thành công!';
    }
  };

  return (
    <>
      <style>
        {`
          .lukhang-success-notification-modal .modal-dialog {
            max-width: 400px !important;
            margin: 1.75rem auto !important;
          }
          
          .lukhang-success-notification-content {
            background: white !important;
            border-radius: 1rem !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
            border: none !important;
            overflow: hidden !important;
            position: relative !important;
          }
          
          .lukhang-success-notification-close {
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
          
          .lukhang-success-notification-close:hover {
            background: #f8f9fa !important;
            color: #495057 !important;
            transform: scale(1.1) !important;
          }
          
          .lukhang-success-notification-body {
            padding: 2.5rem 2rem 1.5rem 2rem !important;
            text-align: center !important;
          }
          
          .lukhang-success-notification-icon {
            width: 80px !important;
            height: 80px !important;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
            border-radius: 50% !important;
            margin: 0 auto 1.5rem auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3) !important;
            animation: lukhangSuccessIconPulse 0.6s ease-out !important;
          }
          
          .lukhang-success-notification-icon i {
            font-size: 2.5rem !important;
            color: white !important;
          }
          
          .lukhang-success-notification-title {
            color: #2d3436 !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            margin-bottom: 0.75rem !important;
            animation: lukhangSuccessTitleSlide 0.8s ease-out 0.2s both !important;
          }
          
          .lukhang-success-notification-message {
            color: #636e72 !important;
            font-size: 1rem !important;
            line-height: 1.5 !important;
            margin-bottom: 0 !important;
            animation: lukhangSuccessMessageSlide 0.8s ease-out 0.4s both !important;
          }
          
          .lukhang-success-notification-progress-container {
            position: relative !important;
            height: 4px !important;
            background: #e9ecef !important;
            overflow: hidden !important;
          }
          
          .lukhang-success-notification-progress-bar {
            height: 100% !important;
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%) !important;
            transition: width 0.1s linear !important;
            position: relative !important;
          }
          
          .lukhang-success-notification-progress-bar::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 10px !important;
            background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%) !important;
            animation: lukhangProgressShimmer 1s ease-in-out infinite !important;
          }
          
          .lukhang-success-notification-timer {
            padding: 0.75rem 1rem !important;
            background: #f8f9fa !important;
            color: #6c757d !important;
            font-size: 0.875rem !important;
            text-align: center !important;
            font-weight: 500 !important;
          }
          
          @keyframes lukhangSuccessIconPulse {
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
          
          @keyframes lukhangSuccessTitleSlide {
            0% {
              opacity: 0 !important;
              transform: translateY(20px) !important;
            }
            100% {
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
          }
          
          @keyframes lukhangSuccessMessageSlide {
            0% {
              opacity: 0 !important;
              transform: translateY(15px) !important;
            }
            100% {
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
          }
          
          @keyframes lukhangProgressShimmer {
            0% {
              transform: translateX(-10px) !important;
            }
            100% {
              transform: translateX(10px) !important;
            }
          }
          
          /* Icon variations */
          .lukhang-success-notification-icon.edit {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3) !important;
          }
          
          .lukhang-success-notification-icon.delete {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
            box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3) !important;
          }
          
          .lukhang-success-notification-icon.add {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3) !important;
          }
          
          /* Progress bar variations */
          .lukhang-success-notification-progress-bar.edit {
            background: linear-gradient(90deg, #0d6efd 0%, #0b5ed7 100%) !important;
          }
          
          .lukhang-success-notification-progress-bar.delete {
            background: linear-gradient(90deg, #dc3545 0%, #c82333 100%) !important;
          }
          
          .lukhang-success-notification-progress-bar.add {
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%) !important;
          }
          
          @media (max-width: 576px) {
            .lukhang-success-notification-modal .modal-dialog {
              max-width: 350px !important;
              margin: 1rem auto !important;
            }
            
            .lukhang-success-notification-body {
              padding: 2rem 1.5rem 1rem 1.5rem !important;
            }
            
            .lukhang-success-notification-icon {
              width: 70px !important;
              height: 70px !important;
            }
            
            .lukhang-success-notification-icon i {
              font-size: 2rem !important;
            }
            
            .lukhang-success-notification-title {
              font-size: 1.3rem !important;
            }
            
            .lukhang-success-notification-message {
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
        className="lukhang-success-notification-modal"
      >
        <div className="lukhang-success-notification-content">
          <button 
            type="button" 
            className="lukhang-success-notification-close"
            onClick={onHide}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
          
          <div className="lukhang-success-notification-body">
            <div className={`lukhang-success-notification-icon ${iconType}`}>
              <i className={getIcon()}></i>
            </div>
            
            <h4 className="lukhang-success-notification-title">
              {getTitle()}
            </h4>
            
            <p className="lukhang-success-notification-message">
              {message}
            </p>
          </div>
          
          {/* Progress bar đếm ngược */}
          <div className="lukhang-success-notification-progress-container">
            <div 
              className={`lukhang-success-notification-progress-bar ${iconType}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Hiển thị thời gian còn lại */}
          <div className="lukhang-success-notification-timer">
            Tự động đóng sau {Math.ceil(timeLeft)} giây
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SuccessNotification;
