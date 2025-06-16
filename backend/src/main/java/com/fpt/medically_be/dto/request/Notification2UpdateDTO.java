package com.fpt.medically_be.dto.request;

import lombok.Data;

@Data
public class Notification2UpdateDTO {

    private Long notificationRecipientId;
    private Long parentId;
    private String response;

}