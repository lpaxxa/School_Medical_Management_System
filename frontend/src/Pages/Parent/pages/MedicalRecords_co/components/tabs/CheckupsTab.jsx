import React, { useState, useEffect } from "react";
import {
  FaCalendarCheck,
  FaExclamationCircle,
  FaInfoCircle,
  FaCalendarAlt,
  FaChevronRight,
} from "react-icons/fa";
import medicalService from "../../../../../../services/medicalService";
import { formatDate } from "../../utils/formatters";
import { cacheData, getCachedData } from "../../utils/helpers";
import CheckupModal from "../modals/CheckupModal";

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
        console.log("Fetching checkups for student:", studentId);
        const response = await medicalService.getMedicalCheckups(studentId);
        console.log("Checkups response:", response);

        // API trả về array trực tiếp
        const checkupsData = Array.isArray(response)
          ? response
          : response.data || [];
        setCheckups(checkupsData);
        console.log("Checkups data:", checkupsData);
      } catch (err) {
        console.error("Error fetching checkups:", err);
        setCheckupsError(
          "Không thể tải dữ liệu kiểm tra sức khỏe. Vui lòng thử lại sau."
        );
      } finally {
        setIsLoadingCheckups(false);
      }
    };

    fetchCheckups();
  }, [studentId]);

  const openCheckupModal = (checkup) => {
    console.log("Opening modal for checkup:", checkup);
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
          <p>
            Học sinh chưa có thông tin kiểm tra sức khỏe định kỳ trong hệ thống.
          </p>
          <p>
            Các dữ liệu sẽ được cập nhật sau mỗi đợt khám sức khỏe tại trường.
          </p>
        </div>
      ) : (
        <div className="checkups-list-simple">
          {checkups.map((checkup) => (
            <div
              className="checkup-row"
              key={checkup.id}
              onClick={() => openCheckupModal(checkup)}
            >
              <div className="checkup-row-content">
                <div className="checkup-date">
                  <FaCalendarAlt className="date-icon" />
                  <span>{formatDate(checkup.checkupDate)}</span>
                </div>
                <div className="checkup-type">
                  <span>{checkup.checkupType || "Kiểm tra định kỳ"}</span>
                </div>
              </div>
              <FaChevronRight className="arrow-icon" />
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
