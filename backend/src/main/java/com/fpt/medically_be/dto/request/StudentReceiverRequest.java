package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class StudentReceiverRequest {
    @NotNull(message = "Parent ID is required")
    @Min(value = 1, message = "Parent ID must be greater than 0")
    @Max(value = 10000, message = "Parent ID must be less than 10000")
    private Long parentId;
    private List<String> studentIds;
}
