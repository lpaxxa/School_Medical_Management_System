package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.response.SystemNotificationDTO;
import com.fpt.medically_be.entity.HealthCampaign;
import com.fpt.medically_be.entity.MedicalCheckup;
import com.fpt.medically_be.entity.Parent;
import com.fpt.medically_be.entity.Student;

import java.util.List;

public interface SystemNotificationService {
    
    /**
     * Get all notifications for a parent
     * @param parentId The parent ID
     * @return List of notifications
     */
    List<SystemNotificationDTO> getNotificationsForParent(Long parentId);
    
    /**
     * Get unread notifications for a parent
     * @param parentId The parent ID
     * @return List of unread notifications
     */
    List<SystemNotificationDTO> getUnreadNotificationsForParent(Long parentId);
    
    /**
     * Mark a notification as read
     * @param notificationId The notification ID
     * @return Updated notification DTO
     */
    SystemNotificationDTO markAsRead(Long notificationId);
    
    /**
     * Mark all notifications as read for a parent
     * @param parentId The parent ID
     */
    void markAllAsReadForParent(Long parentId);
    
    /**
     * Get count of unread notifications for a parent
     * @param parentId The parent ID
     * @return Number of unread notifications
     */
    Long getUnreadCount(Long parentId);
    
    /**
     * Create a health checkup notification for parents
     * @param parent The parent to notify
     * @param student The student involved
     * @param healthCampaign The health campaign
     * @param message The notification message
     * @return Created notification DTO
     */
    SystemNotificationDTO createHealthCheckupNotification(Parent parent, Student student, HealthCampaign healthCampaign, String message);
    
    /**
     * Create a medical checkup result notification for parents
     * @param parent The parent to notify
     * @param student The student involved
     * @param medicalCheckup The medical checkup with results
     * @param message The notification message
     * @return Created notification DTO
     */
    SystemNotificationDTO createMedicalCheckupResultNotification(Parent parent, Student student, MedicalCheckup medicalCheckup, String message);
}