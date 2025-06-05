package com.fpt.medically_be.dto;

import com.fpt.medically_be.entity.Student;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalIncidentDTO {


    private Long incidentId;

    @NotBlank(message = "Incident type is required")
    @Size(max = 150)
    private String incidentType;

    @NotNull(message = "Date time is required")
    private LocalDateTime dateTime;

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

    @Size(max = 150)
    private String medicationsUsed;

    private Boolean parentNotified;
    private Boolean requiresFollowUp;

    @Size(max = 150)
    private String followUpNotes;

    private Long handledBy;


}
