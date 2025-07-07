package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.request.MedicalCheckupRequestDTO;
import com.fpt.medically_be.dto.response.MedicalCheckupResponseDTO;
import com.fpt.medically_be.entity.CheckupStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface MedicalCheckupService {
    /**
     * Lấy danh sách tất cả các kiểm tra y tế
     */
    List<MedicalCheckupResponseDTO> getAllMedicalCheckups();

    /**
     * Lấy thông tin chi tiết một kiểm tra y tế theo ID
     */
    MedicalCheckupResponseDTO getMedicalCheckupById(Long id);

    /**
     * Tạo mới kiểm tra y tế
     */
    MedicalCheckupResponseDTO createMedicalCheckup(MedicalCheckupRequestDTO dto);

    /**
     * Cập nhật thông tin kiểm tra y tế
     */
    MedicalCheckupResponseDTO updateMedicalCheckup(Long id, MedicalCheckupRequestDTO dto);

    /**
     * Cập nhật kết quả kiểm tra y tế
     */
    MedicalCheckupResponseDTO updateMedicalCheckupResults(Long id, MedicalCheckupRequestDTO dto);

    /**
     * Cập nhật trạng thái kiểm tra y tế
     */
    MedicalCheckupResponseDTO updateMedicalCheckupStatus(Long id, CheckupStatus status);

    /**
     * Lấy danh sách kiểm tra y tế theo chiến dịch
     */
    List<MedicalCheckupResponseDTO> getMedicalCheckupsByHealthCampaign(Long campaignId);

    /**
     * Lấy danh sách kiểm tra y tế theo trạng thái và chiến dịch
     */
    List<MedicalCheckupResponseDTO> getMedicalCheckupsByHealthCampaignAndStatus(Long campaignId, CheckupStatus status);

    /**
     * Lấy danh sách kiểm tra y tế theo học sinh
     */
    List<MedicalCheckupResponseDTO> getMedicalCheckupsByStudent(Long studentId);

    /**
     * Lấy danh sách kiểm tra y tế theo nhân viên y tế
     */
    List<MedicalCheckupResponseDTO> getMedicalCheckupsByMedicalStaff(Long staffId);

    /**
     * Lấy danh sách kiểm tra y tế theo khoảng thời gian
     */
    List<MedicalCheckupResponseDTO> getMedicalCheckupsByDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * Gửi kết quả kiểm tra y tế cho phụ huynh
     */
    boolean sendCheckupResultsToParent(Long checkupId);

    // Thêm alias method để tương thích với controller
    default boolean sendResultsToParent(Long checkupId) {
        return sendCheckupResultsToParent(checkupId);
    }

    /**
     * Lấy danh sách học sinh cần theo dõi thêm (có kết quả bất thường)
     */
    List<MedicalCheckupResponseDTO> getStudentsNeedingFollowUp(Long campaignId);

    /**
     * Lên lịch tư vấn sức khỏe cho học sinh cần theo dõi
     */
    boolean scheduleHealthConsultation(Long checkupId, Map<String, Object> consultationDetails);

    /**
     * Lấy danh sách kiểm tra theo trạng thái (thiếu trong service)
     */
    default List<MedicalCheckupResponseDTO> getCheckupsByStatus(CheckupStatus status) {
        return getAllMedicalCheckups().stream()
                .filter(checkup -> checkup.getCheckupStatus() == status)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Lấy danh sách kiểm tra theo ngày (thiếu trong service)
     */
    default List<MedicalCheckupResponseDTO> getCheckupsByDate(LocalDate date) {
        return getAllMedicalCheckups().stream()
                .filter(checkup -> checkup.getCheckupDate() != null && checkup.getCheckupDate().equals(date))
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Alias method để tương thích với controller
     */
    default List<MedicalCheckupResponseDTO> getCheckupHistoryByStudent(Long studentId) {
        return getMedicalCheckupsByStudent(studentId);
    }
}
