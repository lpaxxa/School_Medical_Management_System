package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ParentNotificationResponseDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private LocalDateTime createdAt;
    private String senderName;
    private String studentId;
    private String studentName;
    private String response;
    private LocalDateTime responseAt;

}
