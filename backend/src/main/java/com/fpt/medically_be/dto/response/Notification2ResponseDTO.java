package com.fpt.medically_be.dto.response;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Notification2ResponseDTO {

    private Long notificationId;
    private String title;
    private String message;
    private Boolean isRequest;
    private LocalDateTime createdAt;
    private String senderName;
    private String response;
    private LocalDateTime responseAt;




}