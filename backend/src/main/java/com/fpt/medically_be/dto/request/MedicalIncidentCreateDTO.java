package com.fpt.medically_be.dto.request;

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
    @Size(max = 250)
    private String description;

    @Size(max = 150)
    private String symptoms;

    @NotBlank(message = "Severity level is required")
    @Size(max = 150)
    private String severityLevel;

    @Size(max = 150)
    private String treatment;

    private Boolean parentNotified;
    private Boolean requiresFollowUp;

    @Size(max = 150)
    private String followUpNotes;

    private Long handledById;
    private Long studentId;

    private List<MedicationUsedDTO> medicationsUsed;

}
