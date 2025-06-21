package com.fpt.medically_be.dto.response;

import lombok.Data;

@Data
public class NotificationRecipientsDTO {
    private Long id;
    private String receiverName;
    private String studentId;
    private String studentName;
    private String response;


}
