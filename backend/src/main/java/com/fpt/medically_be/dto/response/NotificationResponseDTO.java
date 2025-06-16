package com.fpt.medically_be.dto.response;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponseDTO {

    private Long notificationId;
    private String title;
    private String message;
    private Boolean isRequest;
    private LocalDateTime createdAt;
    private String senderName;
    private String response;
    private LocalDateTime responseAt;




}
