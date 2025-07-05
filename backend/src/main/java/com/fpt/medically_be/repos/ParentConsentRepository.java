package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.ConsentStatus;
import com.fpt.medically_be.entity.HealthCampaign;
import com.fpt.medically_be.entity.ParentConsent;
import com.fpt.medically_be.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentConsentRepository extends JpaRepository<ParentConsent, Long> {

    // Tìm tất cả đồng ý của phụ huynh cho một chiến dịch
    List<ParentConsent> findByHealthCampaignId(Long healthCampaignId);

    // Tìm tất cả đồng ý của phụ huynh cho một học sinh
    List<ParentConsent> findByStudentId(Long studentId);

    // Tìm tất cả đồng ý của một phụ huynh cụ thể
    @Query("SELECT pc FROM ParentConsent pc WHERE pc.parent.id = :parentId")
    List<ParentConsent> findByParentId(@Param("parentId") Long parentId);

    // Tìm tất cả đồng ý của phụ huynh đã đồng ý cho khám cho một chiến dịch
    List<ParentConsent> findByHealthCampaignIdAndConsentStatus(Long healthCampaignId, ConsentStatus consentStatus);

    // Tìm đồng ý của phụ huynh cho một học sinh trong một chiến dịch cụ thể
    Optional<ParentConsent> findByHealthCampaignIdAndStudentId(Long healthCampaignId, Long studentId);

    // Đếm số lượng đồng ý đã nhận được cho một chiến dịch
    Long countByHealthCampaignIdAndConsentStatus(Long healthCampaignId, ConsentStatus consentStatus);

    // Kiểm tra một học sinh đã có đồng ý của phụ huynh trong một chiến dịch hay chưa
    boolean existsByHealthCampaignIdAndStudentIdAndConsentStatus(Long healthCampaignId, Long studentId, ConsentStatus consentStatus);

    List<ParentConsent> findByParent_Id(String parentId);
}
