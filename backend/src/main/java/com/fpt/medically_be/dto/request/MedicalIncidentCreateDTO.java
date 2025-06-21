package com.fpt.medically_be.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class MedicalIncidentCreateDTO {

    @NotBlank(message = "Incident type is required")
    @Size(max = 150)
    private String incidentType;

    @NotBlank(message = "Description is required")
    @Size(max = 300,message = "Description must not exceed 300 characters")
    private String description;

    @Size(max = 200,message = "Symptoms must not exceed 200 characters")
    private String symptoms;

    @NotBlank(message = "Severity level is required")
    @Size(max = 150)
    private String severityLevel;

    @Size(max = 200,message = "Treatment must not exceed 200 characters")
    private String treatment;

    private Boolean parentNotified;
    private Boolean requiresFollowUp;

    @Size(max = 200,message = "Follow-up notes must not exceed 200 characters")
    private String followUpNotes;

    @Min(value = 1, message = "Handled by ID must be a positive number")
    @Max(value = 200000, message = "Handled by ID must not exceed 200000")
    private Long handledById;
    private String studentId;

    // xem lai
    @Valid
    private List<MedicationUsedDTO> medicationsUsed;

}
