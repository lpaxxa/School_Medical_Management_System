package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_checkups")
@Data
public class MedicalCheckup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "checkup_date", nullable = false)
    private LocalDateTime checkupDate;

    @Column(name = "checkup_type", columnDefinition = "NVARCHAR(50)")
    private String checkupType; // Regular, Vaccination, Emergency, etc.

    private Double height;

    private Double weight;

    private Double bmi;

    @Column(name = "blood_pressure", columnDefinition = "NVARCHAR(50)")
    private String bloodPressure;

    @Column(name = "vision_left", columnDefinition = "NVARCHAR(20)")
    private String visionLeft;

    @Column(name = "vision_right", columnDefinition = "NVARCHAR(20)")
    private String visionRight;

    @Column(name = "hearing_status", columnDefinition = "NVARCHAR(50)")
    private String hearingStatus;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "body_temperature")
    private Double bodyTemperature;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String diagnosis;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String recommendations;

    @Column(name = "follow_up_needed")
    private Boolean followUpNeeded;

    @Column(name = "parent_notified")
    private Boolean parentNotified;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private Nurse medicalStaff;
}
