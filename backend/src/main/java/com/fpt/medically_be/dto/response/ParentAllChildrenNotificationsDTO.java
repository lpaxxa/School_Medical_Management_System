package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.ConsentStatus;
import com.fpt.medically_be.entity.HealthCampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentAllChildrenNotificationsDTO {
    private Long parentId;
    private String parentName;
    
    // Thông tin tổng quan
    private Long totalNotifications;
    private Long pendingConsents;
    private Long approvedConsents;
    private Long completedCheckups;
    
    // Danh sách thông báo của tất cả các con
    private List<ChildNotificationInfo> childrenNotifications;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChildNotificationInfo {
        private Long studentId;
        private String studentName;
        private String studentClass;
        private Integer studentAge;
        private Long totalNotifications;
        private List<NotificationDetail> notifications;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationDetail {
        private Long consentId;
        
        // Thông tin chiến dịch
        private Long healthCampaignId;
        private String campaignTitle;
        private String campaignDescription;
        private LocalDate campaignStartDate;
        private LocalDate campaignEndDate;
        private HealthCampaignStatus campaignStatus;
        
        // Thông tin xác nhận
        private ConsentStatus consentStatus;
        private LocalDateTime consentDate;
        private List<String> specialCheckupItems;
        private String parentNotes;
        
        // Thông tin kiểm tra (nếu đã có)
        private Long medicalCheckupId;
        private String checkupStatus;
        private LocalDate checkupDate;
        private Boolean followUpNeeded;
        private Boolean resultNotified;
        
        // Thông tin thời gian
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
} 