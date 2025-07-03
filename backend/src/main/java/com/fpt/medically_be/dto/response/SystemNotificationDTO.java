package com.fpt.medically_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fpt.medically_be.entity.NotificationType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemNotificationDTO {
    
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private String targetUserType;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    
    // Related entities
    private Long parentId;
    private String parentName;
    private Long studentId;
    private String studentName;
    private Long healthCampaignId;
    private String healthCampaignTitle;
    private Long medicalCheckupId;
    
    // Helper method to mark as read
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}