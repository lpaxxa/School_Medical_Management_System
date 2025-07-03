package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.CheckupStatus;
import com.fpt.medically_be.entity.MedicalCheckup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalCheckupRepository extends JpaRepository<MedicalCheckup, Long> {
    List<MedicalCheckup> findByStudentId(Long studentId);
    List<MedicalCheckup> findByMedicalStaffId(Long staffId);
    List<MedicalCheckup> findByCheckupDateBetween(LocalDate startDate, LocalDate endDate);
    List<MedicalCheckup> findByStudentIdAndCheckupDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    List<MedicalCheckup> findByCheckupType(String checkupType);
    List<MedicalCheckup> findByFollowUpNeeded(Boolean followUpNeeded);

    // Thêm các phương thức cho workflow kiểm tra sức khỏe định kỳ
    List<MedicalCheckup> findByHealthCampaignId(Long healthCampaignId);

    List<MedicalCheckup> findByHealthCampaignIdAndCheckupStatus(Long healthCampaignId, CheckupStatus status);

    // Thêm các phương thức thiếu cho service
    List<MedicalCheckup> findByCheckupStatus(CheckupStatus status);

    List<MedicalCheckup> findByCheckupDate(LocalDate date);

    List<MedicalCheckup> findByParentConsentId(Long parentConsentId);

    Optional<MedicalCheckup> findByHealthCampaignIdAndStudentId(Long healthCampaignId, Long studentId);

    // Đếm số lượng kiểm tra theo trạng thái cho một chiến dịch
    Long countByHealthCampaignIdAndCheckupStatus(Long healthCampaignId, CheckupStatus status);

    // Tìm danh sách kiểm tra có kết quả cần theo dõi thêm
    List<MedicalCheckup> findByHealthCampaignIdAndFollowUpNeededTrue(Long healthCampaignId);

    // Kiểm tra một học sinh đã được khám chưa trong một chiến dịch
    boolean existsByHealthCampaignIdAndStudentIdAndCheckupStatus(
        Long healthCampaignId, Long studentId, CheckupStatus status);

    // Thống kê số lượng học sinh cần theo dõi thêm theo chiến dịch
    @Query("SELECT COUNT(mc) FROM MedicalCheckup mc WHERE mc.healthCampaign.id = ?1 AND mc.followUpNeeded = true")
    Long countStudentsNeedingFollowUpByHealthCampaignId(Long healthCampaignId);
}
