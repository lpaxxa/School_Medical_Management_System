package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VaccinePlanCreateResponse {
    private Long id;
    private String description;
    private LocalDate deadlineDate;
    private LocalDateTime createdAt;
}
