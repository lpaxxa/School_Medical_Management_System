import React, { useState, useEffect } from 'react';
import { FaSyringe, FaExclamationCircle, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import medicalService from '../../../../../../services/medicalService';
import { formatDate } from '../../utils/formatters';
import { cacheData, getCachedData } from '../../utils/helpers';
import VaccinationModal from '../modals/VaccinationModal';

const VaccinationsTab = ({ studentId, parentInfo, studentCode }) => {
  const [vaccinationNotifications, setVaccinationNotifications] = useState([]);
  const [isLoadingVaccinations, setIsLoadingVaccinations] = useState(true);
  const [vaccinationsError, setVaccinationsError] = useState(null);
  
  // Chỉ giữ lại 1 set state cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vaccinationDetail, setVaccinationDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  useEffect(() => {
    const fetchVaccinationData = async () => {
      if (!parentInfo?.id || !studentCode) {
        console.log('Missing parentId or studentCode:', { parentId: parentInfo?.id, studentCode });
        return;
      }

      try {
        setIsLoadingVaccinations(true);
        const data = await medicalService.getVaccinationNotifications(
          parentInfo.id,
          studentCode
        );
        setVaccinationNotifications(data);
      } catch (error) {
        console.error('Error fetching vaccination data:', error);
        setVaccinationsError('Không thể tải dữ liệu tiêm chủng');
      } finally {
        setIsLoadingVaccinations(false);
      }
    };

    fetchVaccinationData();
  }, [parentInfo?.id, studentCode]);

  // Chỉ giữ lại 1 function xử lý click
  const handleViewDetails = async (notification) => {
    const notificationId = notification.id;
    
    console.log('🎯 handleViewDetails called with notification:', notification);
    console.log('🆔 Using notificationId:', notificationId);
    
    setSelectedNotificationId(notificationId);
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    setDetailError(null);
    setVaccinationDetail(null);
    
    try {
      console.log('📡 Calling medicalService.getVaccinationDetail...');
      const detail = await medicalService.getVaccinationDetail(notificationId);
      console.log('✅ Received vaccination detail:', detail);
      setVaccinationDetail(detail);
    } catch (error) {
      console.error('❌ Error in handleViewDetails:', error);
      setDetailError('Không thể tải thông tin chi tiết tiêm chủng');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVaccinationDetail(null);
    setSelectedNotificationId(null);
    setDetailError(null);
  };

  return (
    <div className="vaccinations-panel">
      <h3>Lịch sử tiêm chủng</h3>
      
      {vaccinationsError ? (
        <div className="error-message">
          <FaExclamationCircle /> {vaccinationsError}
        </div>
      ) : isLoadingVaccinations ? (
        <div className="data-loading">
          <div className="loading-spinner small"></div>
          <p>Đang tải dữ liệu tiêm chủng...</p>
        </div>
      ) : vaccinationNotifications.length === 0 ? (
        <div className="no-data-message">
          <FaSyringe />
          <h4>Chưa có thông tin tiêm chủng</h4>
          <p>Học sinh chưa có thông tin tiêm chủng nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="vaccinations-list">
          {vaccinationNotifications.map((notification) => (
            <div 
              className="vaccination-card" 
              key={notification.id}
              onClick={() => handleViewDetails(notification)} // Chỉ dùng 1 function
            >
              <div className="vaccination-header">
                <div className="vaccination-title">
                  <FaSyringe />
                  <h4>{notification.title}</h4>
                </div>
                <div className="vaccination-date">
                  <FaCalendarAlt />
                  {formatDate(notification.receivedAt)}
                </div>
              </div>
              <div className="vaccination-content">
                <p>{notification.message}</p>
                <div className="student-info">
                  <strong>Học sinh:</strong> {notification.studentName}
                </div>
              </div>
              <div className="vaccination-footer">
                <span className="view-details">Xem chi tiết <FaChevronRight /></span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Chỉ dùng 1 modal */}
      <VaccinationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoading={isLoadingDetail}
        error={detailError}
        vaccinationDetail={vaccinationDetail}
      />
    </div>
  );
};

export default VaccinationsTab;