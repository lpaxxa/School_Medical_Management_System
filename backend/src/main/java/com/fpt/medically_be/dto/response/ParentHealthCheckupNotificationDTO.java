package com.fpt.medically_be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ParentHealthCheckupNotificationDTO {
    private Long checkupId;
    private String studentName;
    private String studentId;
    private String studentClass;
    private LocalDate checkupDate;
    private String checkupType;
    private String medicalStaffName;
    private String diagnosis;
    private String recommendations;
    private Boolean followUpNeeded;
    private String urgencyLevel; // NORMAL, ATTENTION_NEEDED, URGENT
    private String parentName;
    private String parentEmail;
    
    // Health metrics that triggered the notification
    private String healthConcerns;
    private String actionRequired;
    private String contactInstructions;
    private String nextAppointmentRecommended;
} 