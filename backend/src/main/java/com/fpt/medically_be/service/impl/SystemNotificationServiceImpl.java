package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.response.SystemNotificationDTO;
import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.repos.SystemNotificationRepository;
import com.fpt.medically_be.service.SystemNotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SystemNotificationServiceImpl implements SystemNotificationService {

    private final SystemNotificationRepository systemNotificationRepository;

    @Autowired
    public SystemNotificationServiceImpl(SystemNotificationRepository systemNotificationRepository) {
        this.systemNotificationRepository = systemNotificationRepository;
    }

    @Override
    public List<SystemNotificationDTO> getNotificationsForParent(Long parentId) {
        return systemNotificationRepository.findByParentIdOrderByCreatedAtDesc(parentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SystemNotificationDTO> getUnreadNotificationsForParent(Long parentId) {
        return systemNotificationRepository.findByParentIdAndIsReadFalseOrderByCreatedAtDesc(parentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SystemNotificationDTO markAsRead(Long notificationId) {
        SystemNotification notification = systemNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with ID: " + notificationId));
        
        notification.markAsRead();
        SystemNotification savedNotification = systemNotificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    @Override
    public void markAllAsReadForParent(Long parentId) {
        List<SystemNotification> unreadNotifications = systemNotificationRepository.findByParentIdAndIsReadFalse(parentId);
        unreadNotifications.forEach(SystemNotification::markAsRead);
        systemNotificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public Long getUnreadCount(Long parentId) {
        return systemNotificationRepository.countByParentIdAndIsReadFalse(parentId);
    }

    @Override
    public SystemNotificationDTO createHealthCheckupNotification(Parent parent, Student student, HealthCampaign healthCampaign, String message) {
        SystemNotification notification = new SystemNotification();
        notification.setTitle("Thông báo khám sức khỏe định kỳ");
        notification.setMessage(message);
        notification.setType(NotificationType.HEALTH_CHECKUP);
        notification.setTargetUserType("PARENT");
        notification.setParent(parent);
        notification.setStudent(student);
        notification.setHealthCampaign(healthCampaign);
        
        SystemNotification savedNotification = systemNotificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    @Override
    public SystemNotificationDTO createMedicalCheckupResultNotification(Parent parent, Student student, MedicalCheckup medicalCheckup, String message) {
        SystemNotification notification = new SystemNotification();
        notification.setTitle("Kết quả khám sức khỏe");
        notification.setMessage(message);
        notification.setType(NotificationType.HEALTH_CHECKUP);
        notification.setTargetUserType("PARENT");
        notification.setParent(parent);
        notification.setStudent(student);
        notification.setMedicalCheckup(medicalCheckup);
        
        SystemNotification savedNotification = systemNotificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    // Helper method to convert entity to DTO
    private SystemNotificationDTO convertToDTO(SystemNotification notification) {
        return SystemNotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .targetUserType(notification.getTargetUserType())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .parentId(notification.getParent() != null ? notification.getParent().getId() : null)
                .parentName(notification.getParent() != null ? notification.getParent().getFullName() : null)
                .studentId(notification.getStudent() != null ? notification.getStudent().getId() : null)
                .studentName(notification.getStudent() != null ? notification.getStudent().getFullName() : null)
                .healthCampaignId(notification.getHealthCampaign() != null ? notification.getHealthCampaign().getId() : null)
                .healthCampaignTitle(notification.getHealthCampaign() != null ? notification.getHealthCampaign().getTitle() : null)
                .medicalCheckupId(notification.getMedicalCheckup() != null ? notification.getMedicalCheckup().getId() : null)
                .build();
    }
}