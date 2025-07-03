package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.HealthCampaign;
import com.fpt.medically_be.entity.HealthCampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HealthCampaignRepository extends JpaRepository<HealthCampaign, Long> {
    List<HealthCampaign> findByTitleContainingIgnoreCase(String title);
    List<HealthCampaign> findByStatus(HealthCampaignStatus status);

    // Tìm các chiến dịch đang hoạt động
    List<HealthCampaign> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
        HealthCampaignStatus status, LocalDate currentDate, LocalDate currentDate2);

    // Tìm chiến dịch sắp tới
    List<HealthCampaign> findByStatusAndStartDateGreaterThan(HealthCampaignStatus status, LocalDate currentDate);

    // Tìm chiến dịch đã kết thúc
    List<HealthCampaign> findByStatusAndEndDateLessThan(HealthCampaignStatus status, LocalDate currentDate);

    // Thống kê số lượng học sinh đã đồng ý tham gia chiến dịch
    @Query("SELECT COUNT(pc) FROM ParentConsent pc WHERE pc.healthCampaign.id = ?1 AND pc.consentGiven = true")
    Long countConsentedStudentsByHealthCampaignId(Long healthCampaignId);

    // Thống kê số lượng học sinh đã hoàn thành khám
    @Query("SELECT COUNT(mc) FROM MedicalCheckup mc WHERE mc.healthCampaign.id = ?1 AND mc.checkupStatus = 'COMPLETED'")
    Long countCompletedCheckupsByHealthCampaignId(Long healthCampaignId);
}
