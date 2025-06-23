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
  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);
  const [vaccinationDetail, setVaccinationDetail] = useState(null);
  const [isLoadingVaccinationDetail, setIsLoadingVaccinationDetail] = useState(false);
  const [vaccinationDetailError, setVaccinationDetailError] = useState(null);

  useEffect(() => {
    if (!parentInfo || !studentCode) return;
    
    const fetchVaccinations = async () => {
      setIsLoadingVaccinations(true);
      setVaccinationsError(null);
      
      try {
        // Check cache first
        const cacheKey = `vaccinations_${parentInfo.id}_${studentCode}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
          setVaccinationNotifications(cachedData);
          setIsLoadingVaccinations(false);
          return;
        }
        
        const response = await medicalService.getVaccinationNotifications(parentInfo.id, studentCode);
        const notifications = response.data || [];
        setVaccinationNotifications(notifications);
        
        // Cache data
        cacheData(cacheKey, notifications);
      } catch (err) {
        console.error('Error fetching vaccination notifications:', err);
        setVaccinationsError('Không thể tải dữ liệu tiêm chủng. Vui lòng thử lại sau.');
      } finally {
        setIsLoadingVaccinations(false);
      }
    };
    
    fetchVaccinations();
  }, [parentInfo, studentCode]);
  
  const fetchVaccinationDetail = async (notificationId) => {
    setIsLoadingVaccinationDetail(true);
    setVaccinationDetailError(null);
    
    try {
      // Check cache first
      const cacheKey = `vaccination_detail_${notificationId}`;
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        setVaccinationDetail(cachedData);
        setIsVaccinationModalOpen(true);
        setIsLoadingVaccinationDetail(false);
        return;
      }
      
      const response = await medicalService.getVaccinationDetail(notificationId);
      const detail = response.data || {};
      setVaccinationDetail(detail);
      
      // Cache data
      cacheData(cacheKey, detail);
      setIsVaccinationModalOpen(true);
    } catch (err) {
      console.error('Error fetching vaccination detail:', err);
      setVaccinationDetailError('Không thể tải chi tiết tiêm chủng. Vui lòng thử lại sau.');
      setIsVaccinationModalOpen(true);
    } finally {
      setIsLoadingVaccinationDetail(false);
    }
  };
  
  const closeVaccinationModal = () => {
    setIsVaccinationModalOpen(false);
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
              onClick={() => fetchVaccinationDetail(notification.id)}
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
              <div className="vaccination-footer">
                <span className="view-details">Xem chi tiết <FaChevronRight /></span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <VaccinationModal
        isOpen={isVaccinationModalOpen}
        onClose={closeVaccinationModal}
        isLoading={isLoadingVaccinationDetail}
        error={vaccinationDetailError}
        vaccinationDetail={vaccinationDetail}
      />
    </div>
  );
};

export default VaccinationsTab;