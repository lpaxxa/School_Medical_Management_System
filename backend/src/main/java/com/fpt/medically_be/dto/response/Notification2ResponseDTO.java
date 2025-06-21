package com.fpt.medically_be.dto.response;
import com.fpt.medically_be.entity.NotificationRecipients;
import com.fpt.medically_be.entity.NotificationType;
import lombok.Data;

import javax.management.Notification;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Notification2ResponseDTO {
    private Long id;
    private String title;
    private String message;
    private Boolean isRequest;
    private LocalDateTime createdAt;
    private String senderName;
    private NotificationType type;

    private List<NotificationRecipientsDTO> recipients;


}