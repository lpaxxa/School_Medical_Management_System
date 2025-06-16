package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Notification2ReceiveResponse {

    private Long id;
    private String title;
    private String message;
    private Boolean isRequest;
    private LocalDateTime createdAt;
    private String senderName;
    private String response;
    private LocalDateTime responseAt;

}
