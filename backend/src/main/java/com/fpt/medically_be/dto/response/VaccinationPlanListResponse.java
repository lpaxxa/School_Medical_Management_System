package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.VaccinationPlanStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data

public class VaccinationPlanListResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate vaccinationDate;
//    private String status;
    private LocalDateTime deadlineDate;
    private VaccinationPlanStatus status;

}
