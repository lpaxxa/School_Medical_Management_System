package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;



@Data
public class VaccinationRequestDTO {
    private Long vaccineId;
    private LocalDate vaccinationDate;
    private String administeredAt;
    private String notes;
    private String parentNotes;
}
