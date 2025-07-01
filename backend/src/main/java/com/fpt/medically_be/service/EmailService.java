package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.response.ParentHealthCheckupNotificationDTO;

public interface EmailService {
    void sendAccountInfoEmail(String memberId);
    
    /**
     * Send health checkup results notification to parent
     * @param notification The health checkup notification details
     */
    void sendHealthCheckupNotificationEmail(ParentHealthCheckupNotificationDTO notification);
    
    /**
     * Send health checkup results notification to parent by checkup ID
     * @param checkupId The medical checkup ID
     */
    void sendHealthCheckupNotificationByCheckupId(Long checkupId);
    
    /**
     * Send batch health checkup notifications to multiple parents
     * @param checkupIds List of medical checkup IDs to send notifications for
     */
    void sendBatchHealthCheckupNotifications(java.util.List<Long> checkupIds);
}
