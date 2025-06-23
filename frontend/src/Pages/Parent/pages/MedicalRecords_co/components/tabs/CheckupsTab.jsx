import React, { useState, useEffect } from 'react';
import { 
  FaCalendarCheck, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaCalendarAlt 
} from 'react-icons/fa';
import medicalService from '../../../../../../services/medicalService';
import { formatDate } from '../../utils/formatters';
import { cacheData, getCachedData } from '../../utils/helpers';
import CheckupModal from '../modals/CheckupModal';

const CheckupsTab = ({ studentId }) => {
  const [checkups, setCheckups] = useState([]);
  const [isLoadingCheckups, setIsLoadingCheckups] = useState(true);
  const [checkupsError, setCheckupsError] = useState(null);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    
    const fetchCheckups = async () => {
      setIsLoadingCheckups(true);
      setCheckupsError(null);
      
      try {
        // Check cache first
        const cacheKey = `checkups_${studentId}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
          setCheckups(cachedData);
          setIsLoadingCheckups(false);
          return;
        }
        
        const response = await medicalService.getMedicalCheckups(studentId);
        const checkupsData = response.data || [];
        setCheckups(checkupsData);
        
        // Cache data
        cacheData(cacheKey, checkupsData);
      } catch (err) {
        console.error('Error fetching checkups:', err);
        setCheckupsError('Không thể tải dữ liệu kiểm tra sức khỏe. Vui lòng thử lại sau.');
      } finally {
        setIsLoadingCheckups(false);
      }
    };
    
    fetchCheckups();
  }, [studentId]);

  const openCheckupModal = (checkup) => {
    setSelectedCheckup(checkup);
    setIsCheckupModalOpen(true);
  };

  const closeCheckupModal = () => {
    setIsCheckupModalOpen(false);
    setSelectedCheckup(null);
  };

  return (
    <div className="checkups-panel">
      <h3>Lịch sử kiểm tra sức khỏe định kỳ</h3>
      
      {checkupsError ? (
        <div className="error-message">
          <FaExclamationCircle /> {checkupsError}
        </div>
      ) : isLoadingCheckups ? (
        <div className="data-loading">
          <div className="loading-spinner small"></div>
          <p>Đang tải dữ liệu kiểm tra sức khỏe...</p>
        </div>
      ) : checkups.length === 0 ? (
        <div className="no-data-message">
          <FaInfoCircle />
          <h4>Chưa có thông tin kiểm tra sức khỏe định kỳ</h4>
          <p>Học sinh chưa có thông tin kiểm tra sức khỏe định kỳ trong hệ thống.</p>
          <p>Các dữ liệu sẽ được cập nhật sau mỗi đợt khám sức khỏe tại trường.</p>
        </div>
      ) : (
        <div className="checkups-list">
          {checkups.map((checkup) => (
            <div
              className="checkup-card"
              key={checkup.id}
              onClick={() => openCheckupModal(checkup)}
            >
              <div className="checkup-header">
                <div className="checkup-title">
                  <FaCalendarCheck />
                  <h4>{checkup.examType || "Kiểm tra sức khỏe định kỳ"}</h4>
                </div>
                <div className="checkup-date">
                  <FaCalendarAlt />
                  {formatDate(checkup.examDate)}
                </div>
              </div>
              <div className="checkup-content">
                <p>
                  <strong>Kết quả:</strong> {checkup.examResult || "Không có kết quả"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal for checkup details */}
      {isCheckupModalOpen && selectedCheckup && (
        <CheckupModal
          isOpen={isCheckupModalOpen}
          onClose={closeCheckupModal}
          checkup={selectedCheckup}
        />
      )}
    </div>
  );
};

export default CheckupsTab;