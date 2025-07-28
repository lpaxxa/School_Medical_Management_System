import React, { useState, useEffect } from 'react';
import sessionService from '../services/sessionService';
import { useAuth } from '../context/AuthContext';

const SessionWarningModal = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { logout } = useAuth();

  useEffect(() => {
    const handleSessionWarning = (timeRemaining) => {
      setTimeLeft(timeRemaining);
      setShowWarning(true);
    };

    const handleSessionExpired = () => {
      setShowWarning(false);
      // AuthContext will handle the logout
    };

    // Register callbacks
    sessionService.onSessionWarning(handleSessionWarning);
    sessionService.onSessionExpired(handleSessionExpired);

    // Cleanup
    return () => {
      sessionService.removeCallback(handleSessionWarning);
      sessionService.removeCallback(handleSessionExpired);
    };
  }, []);

  const handleExtendSession = () => {
    sessionService.extendSession();
    setShowWarning(false);
  };

  const handleLogout = () => {
    logout();
    setShowWarning(false);
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          ⏰
        </div>
        
        <h3 style={{
          margin: '0 0 15px 0',
          color: '#333',
          fontSize: '20px'
        }}>
          Phiên đăng nhập sắp hết hạn
        </h3>
        
        <p style={{
          margin: '0 0 20px 0',
          color: '#666',
          lineHeight: '1.5'
        }}>
          Phiên đăng nhập của bạn sẽ hết hạn trong{' '}
          <strong style={{ color: '#e74c3c' }}>
            {formatTime(timeLeft)}
          </strong>
        </p>
        
        <p style={{
          margin: '0 0 25px 0',
          color: '#666',
          fontSize: '14px'
        }}>
          Bạn có muốn gia hạn phiên đăng nhập không?
        </p>
        
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleExtendSession}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Gia hạn phiên
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#7f8c8d'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#95a5a6'}
          >
            Đăng xuất
          </button>
        </div>
        
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          💡 Mẹo: Hoạt động trên trang sẽ tự động gia hạn phiên đăng nhập
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
