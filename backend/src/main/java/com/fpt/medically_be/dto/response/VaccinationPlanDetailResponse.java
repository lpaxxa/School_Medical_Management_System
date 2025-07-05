package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VaccinationPlanDetailResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate vaccinationDate;
    private String status;
    private LocalDateTime deadlineDate;
    private List<VaccineInfoResponse> vaccines;
    private List<StudentInfoResponse> students;


}
