import React, { useState, useEffect } from 'react';
import sessionUtils from '../utils/sessionUtils';

/**
 * Session Debug Panel - Only shows in development mode
 * Provides real-time session monitoring and debugging tools
 */
const SessionDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionHealth, setSessionHealth] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionHealth(sessionUtils.monitor.getSessionHealth());
      setStorageInfo(sessionUtils.cleanup.getStorageInfo());
    };

    // Update immediately
    updateSessionInfo();

    // Update every 30 seconds
    const interval = setInterval(updateSessionInfo, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleLogSessionInfo = () => {
    sessionUtils.debug.logSessionStatus();
  };

  const handleCleanupSessions = () => {
    const cleaned = sessionUtils.cleanup.cleanupExpiredSessions();
    alert(`Cleaned up ${cleaned} expired session items`);
  };

  const handleSimulateExpiration = () => {
    sessionUtils.dev.simulateExpiration();
    // Update session info after simulation
    setTimeout(() => {
      setSessionHealth(sessionUtils.monitor.getSessionHealth());
    }, 100);
  };

  const handleExtendSession = () => {
    sessionUtils.dev.extendSessionForTesting(1);
    // Update session info after extension
    setTimeout(() => {
      setSessionHealth(sessionUtils.monitor.getSessionHealth());
    }, 100);
  };

  if (!sessionHealth) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 10000,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      {/* Toggle Button */}
      <button
        onClick={handleToggleVisibility}
        style={{
          backgroundColor: sessionHealth.color,
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px'
        }}
        title={`Session Status: ${sessionHealth.status}`}
      >
        🔍
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          right: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          minWidth: '300px',
          maxWidth: '400px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            borderBottom: '1px solid #333',
            paddingBottom: '10px'
          }}>
            <h4 style={{ margin: 0, color: '#fff' }}>Session Debug</h4>
            <button
              onClick={handleToggleVisibility}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Session Status */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '5px'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: sessionHealth.color,
                marginRight: '8px'
              }}></div>
              <strong>Status: {sessionHealth.status}</strong>
            </div>
            <div>Authenticated: {sessionHealth.isAuthenticated ? '✅' : '❌'}</div>
            <div>Valid Token: {sessionHealth.hasValidToken ? '✅' : '❌'}</div>
            <div>Time Left: {sessionHealth.formattedTimeLeft}</div>
          </div>

          {/* Storage Info */}
          {storageInfo && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Storage:</strong>
              <div>Items: {storageInfo.totalItems}</div>
              <div>Size: {storageInfo.formattedSize}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <button
              onClick={handleLogSessionInfo}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Log Session Info
            </button>
            
            <button
              onClick={handleCleanupSessions}
              style={{
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Cleanup Expired
            </button>

            <div style={{
              display: 'flex',
              gap: '4px'
            }}>
              <button
                onClick={handleSimulateExpiration}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  flex: 1
                }}
              >
                Expire
              </button>
              
              <button
                onClick={handleExtendSession}
                style={{
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  flex: 1
                }}
              >
                Extend
              </button>
            </div>
          </div>

          <div style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid #333',
            fontSize: '10px',
            color: '#999'
          }}>
            Dev Mode Only - Updates every 30s
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDebugPanel;
