import React, { useState, useEffect } from 'react';

const InventoryNotification = ({ 
  show, 
  onHide, 
  title = "Thành công!", 
  message = "Thao tác đã được thực hiện thành công.",
  autoHideDelay = 3000,
  iconType = "check" // check, edit, delete, add, view
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
      case 'view':
        return 'fas fa-eye';
      default:
        return 'fas fa-check';
    }
  };

  const getTitle = () => {
    if (title !== "Thành công!") return title;
    
    switch (iconType) {
      case 'edit':
        return 'Cập nhật vật phẩm thành công!';
      case 'delete':
        return 'Xóa vật phẩm thành công!';
      case 'add':
        return 'Thêm vật phẩm thành công!';
      case 'view':
        return 'Xem chi tiết vật phẩm!';
      default:
        return 'Thành công!';
    }
  };

  const getDefaultMessage = () => {
    if (message !== "Thao tác đã được thực hiện thành công.") return message;
    
    switch (iconType) {
      case 'edit':
        return 'Thông tin vật phẩm đã được cập nhật thành công vào hệ thống kho y tế.';
      case 'delete':
        return 'Vật phẩm đã được xóa khỏi hệ thống kho y tế thành công.';
      case 'add':
        return 'Vật phẩm mới đã được thêm vào hệ thống kho y tế thành công.';
      case 'view':
        return 'Đang hiển thị thông tin chi tiết của vật phẩm được chọn.';
      default:
        return 'Thao tác trên hệ thống kho y tế đã được thực hiện thành công.';
    }
  };

  if (!show) return null;

  return (
    <>
      <style>
        {`
          .lukhang-inventory-notification-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.5) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 2050 !important;
            animation: lukhangInventoryFadeIn 0.3s ease-out !important;
          }
          
          .lukhang-inventory-notification-dialog {
            max-width: 450px !important;
            width: 90% !important;
            margin: 1.75rem auto !important;
            z-index: 2051 !important;
            animation: lukhangInventorySlideIn 0.4s ease-out !important;
          }
      
          .lukhang-inventory-notification-content {
            background: white !important;
            border-radius: 1rem !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
            border: none !important;
            overflow: hidden !important;
            position: relative !important;
          }
          
          .lukhang-inventory-notification-close {
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
          
          .lukhang-inventory-notification-close:hover {
            background: #f8f9fa !important;
            color: #495057 !important;
            transform: scale(1.1) !important;
          }
          
          .lukhang-inventory-notification-body {
            padding: 2.5rem 2rem 1.5rem 2rem !important;
            text-align: center !important;
          }
          
          .lukhang-inventory-notification-icon {
            width: 80px !important;
            height: 80px !important;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
            border-radius: 50% !important;
            margin: 0 auto 1.5rem auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3) !important;
            animation: lukhangInventoryIconPulse 0.6s ease-out !important;
          }
          
          .lukhang-inventory-notification-icon i {
            font-size: 2.5rem !important;
            color: white !important;
          }
          
          .lukhang-inventory-notification-title {
            color: #2d3436 !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            margin-bottom: 0.75rem !important;
            animation: lukhangInventoryTitleSlide 0.8s ease-out 0.2s both !important;
          }
          
          .lukhang-inventory-notification-message {
            color: #636e72 !important;
            font-size: 1rem !important;
            line-height: 1.5 !important;
            margin-bottom: 0 !important;
            animation: lukhangInventoryMessageSlide 0.8s ease-out 0.4s both !important;
          }
          
          .lukhang-inventory-notification-progress-container {
            position: relative !important;
            height: 4px !important;
            background: #e9ecef !important;
            overflow: hidden !important;
          }
          
          .lukhang-inventory-notification-progress-bar {
            height: 100% !important;
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%) !important;
            transition: width 0.1s linear !important;
            position: relative !important;
          }
          
          .lukhang-inventory-notification-progress-bar::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 10px !important;
            background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%) !important;
            animation: lukhangInventoryProgressShimmer 1s ease-in-out infinite !important;
          }
          
          .lukhang-inventory-notification-timer {
            padding: 0.75rem 1rem !important;
            background: #f8f9fa !important;
            color: #6c757d !important;
            font-size: 0.875rem !important;
            text-align: center !important;
            font-weight: 500 !important;
          }
          
          @keyframes lukhangInventoryFadeIn {
            0% {
              opacity: 0 !important;
            }
            100% {
              opacity: 1 !important;
            }
          }
          
          @keyframes lukhangInventorySlideIn {
            0% {
              opacity: 0 !important;
              transform: translateY(-50px) scale(0.8) !important;
            }
            100% {
              opacity: 1 !important;
              transform: translateY(0) scale(1) !important;
            }
          }
          
          @keyframes lukhangInventoryIconPulse {
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
          
          @keyframes lukhangInventoryTitleSlide {
            0% {
              opacity: 0 !important;
              transform: translateY(20px) !important;
            }
            100% {
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
          }
          
          @keyframes lukhangInventoryMessageSlide {
            0% {
              opacity: 0 !important;
              transform: translateY(15px) !important;
            }
            100% {
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
          }
          
          @keyframes lukhangInventoryProgressShimmer {
            0% {
              transform: translateX(-10px) !important;
            }
            100% {
              transform: translateX(10px) !important;
            }
          }
          
          /* Icon variations for inventory operations */
          .lukhang-inventory-notification-icon.edit {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3) !important;
          }
          
          .lukhang-inventory-notification-icon.delete {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
            box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3) !important;
          }
          
          .lukhang-inventory-notification-icon.add {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3) !important;
          }
          
          .lukhang-inventory-notification-icon.view {
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%) !important;
            box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3) !important;
          }
          
          /* Progress bar variations */
          .lukhang-inventory-notification-progress-bar.edit {
            background: linear-gradient(90deg, #0d6efd 0%, #0b5ed7 100%) !important;
          }
          
          .lukhang-inventory-notification-progress-bar.delete {
            background: linear-gradient(90deg, #dc3545 0%, #c82333 100%) !important;
          }
          
          .lukhang-inventory-notification-progress-bar.add {
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%) !important;
          }
          
          .lukhang-inventory-notification-progress-bar.view {
            background: linear-gradient(90deg, #17a2b8 0%, #138496 100%) !important;
          }
          
          @media (max-width: 576px) {
            .lukhang-inventory-notification-dialog {
              max-width: 350px !important;
              margin: 1rem auto !important;
            }
            
            .lukhang-inventory-notification-body {
              padding: 2rem 1.5rem 1rem 1.5rem !important;
            }
            
            .lukhang-inventory-notification-icon {
              width: 70px !important;
              height: 70px !important;
            }
            
            .lukhang-inventory-notification-icon i {
              font-size: 2rem !important;
            }
            
            .lukhang-inventory-notification-title {
              font-size: 1.3rem !important;
            }
            
            .lukhang-inventory-notification-message {
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>
      
      <div className="lukhang-inventory-notification-overlay">
        <div className="lukhang-inventory-notification-dialog">
          <div className="lukhang-inventory-notification-content">
            <button 
              type="button" 
              className="lukhang-inventory-notification-close"
              onClick={onHide}
              aria-label="Close"
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div className="lukhang-inventory-notification-body">
              <div className={`lukhang-inventory-notification-icon ${iconType}`}>
                <i className={getIcon()}></i>
              </div>
              
              <h4 className="lukhang-inventory-notification-title">
                {getTitle()}
              </h4>
              
              <p className="lukhang-inventory-notification-message">
                {getDefaultMessage()}
              </p>
            </div>
            
            {/* Progress bar đếm ngược */}
            <div className="lukhang-inventory-notification-progress-container">
              <div 
                className={`lukhang-inventory-notification-progress-bar ${iconType}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Hiển thị thời gian còn lại */}
            <div className="lukhang-inventory-notification-timer">
              <i className="fas fa-clock me-1"></i>
              Tự động đóng sau {Math.ceil(timeLeft)} giây
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryNotification;
