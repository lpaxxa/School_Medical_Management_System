package com.fpt.medically_be.dto.request;

import com.fpt.medically_be.entity.NotificationType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.util.List;

@Data
public class Notification2RequestDTO {
    @NotNull(message = "Title is required")
    private String title;
    @NotNull(message = "Message is required")
    private String message;
    private Boolean isRequest;
    @Min(value = 1,message = "Created by ID must be greater than 0")
    @Max(value = 10000, message = "Created by ID must be less than 10000")
    private Long senderId;
    private NotificationType type;
    private List<String> classIds;
    private List<Long> receiverIds;


}
