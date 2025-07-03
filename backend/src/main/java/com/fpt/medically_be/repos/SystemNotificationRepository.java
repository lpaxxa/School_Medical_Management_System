package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, Long> {
    
    List<SystemNotification> findByParentIdOrderByCreatedAtDesc(Long parentId);
    
    List<SystemNotification> findByParentIdAndIsReadFalseOrderByCreatedAtDesc(Long parentId);
    
    List<SystemNotification> findByParentIdAndIsReadFalse(Long parentId);
    
    Long countByParentIdAndIsReadFalse(Long parentId);
    
    List<SystemNotification> findByStudentId(Long studentId);
    
    List<SystemNotification> findByHealthCampaignId(Long healthCampaignId);
    
    List<SystemNotification> findByMedicalCheckupId(Long medicalCheckupId);
}