package com.fpt.medically_be.dto.request;

import jakarta.persistence.Column;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class NotificationRequestDTO {
    private String title;
    private String message;
    private Boolean isRequest;
    @Min(value = 1,message = "Created by ID must be greater than 0")
    @Max(value = 10000, message = "Created by ID must be less than 10000")
    private Long senderId;

    @Valid
    @Size(min = 1, message = "At least one receiver ID is required")
    private List<@Min(value = 1)@Max(value = 10000) Long> receiverIds;
}
