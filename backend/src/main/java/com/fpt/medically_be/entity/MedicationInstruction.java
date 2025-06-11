package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "medication_instructions")
@Data
public class MedicationInstruction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "health_profile_id", nullable = false)
    private HealthProfile healthProfile;

    @Column(name = "medication_name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String medicationName;

    @Column(name = "dosage_instructions", columnDefinition = "NVARCHAR(MAX)")
    private String dosageInstructions;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "frequency_per_day")
    private Integer frequencyPerDay;

    @Column(name = "time_of_day", columnDefinition = "NVARCHAR(MAX)")
    private String timeOfDay;  // JSON array of times

    @Column(name = "special_instructions", columnDefinition = "NVARCHAR(MAX)")
    private String specialInstructions;

    @Column(name = "parent_provided")
    private Boolean parentProvided;


    @Column(name = "created_date")
    private LocalDate createdDate;

    @Column(name = "status", columnDefinition = "NVARCHAR(50)")
    private String status; // Pending_Approval, Approved, Rejected

    @Column(name = "rejection_reason", columnDefinition = "NVARCHAR(MAX)")
    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Nurse approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @ManyToOne
    @JoinColumn(name = "requested_by")
    private Parent requestedBy;
}
