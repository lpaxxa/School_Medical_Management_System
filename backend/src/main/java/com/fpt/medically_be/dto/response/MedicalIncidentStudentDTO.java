package com.fpt.medically_be.dto.response;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MedicalIncidentStudentDTO {
    private Long incidentId;

    @NotBlank(message = "Incident type is required")
    @Size(max = 150)
    private String incidentType;

    @Column(name = "date_time")
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
    private Long staffId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String className;
    private String gradeLevel;
    private String schoolYear;
    private String staffName;
    private String studentId;
    private String fullNameParent;
    private String phoneNumber;
    private String imageMedicalUrl;



}
