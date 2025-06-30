package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.dto.SpecialCheckupConsentDTO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class HealthCheckupNotificationResponse {
    private Long notificationId;
    private Long notificationRecipientId;
    private String title;
    private String message;
    private String studentName;
    private String studentId;
    private LocalDateTime createdAt;
    private String response; // PENDING, ACCEPTED, REJECTED
    private LocalDateTime responseAt;

    // Danh sách các phần khám đặc biệt cần phụ huynh xác nhận
    private List<SpecialCheckupConsentDTO> specialCheckupConsents;
}
