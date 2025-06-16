package com.fpt.medically_be.dto.response;

import lombok.Data;

@Data
public class NotificationUpdateDTO {

    private Long notificationRecipientId;
    private Long parentId;
    private String response;

}
