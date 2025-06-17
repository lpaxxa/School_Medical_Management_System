package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "health_profiles")
@SQLDelete(sql = "UPDATE health_profiles SET isActive = 0 WHERE id=?", table = "health_profiles")
@SQLRestriction("isActive = 1")
@Data
public class HealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "healthProfile")
    private Student student;

    @Column(name = "blood_type", columnDefinition = "NVARCHAR(10)")
    private String bloodType;

    private Double height;

    private Double weight;

    @Column(name = "bmi")
    private Double bmi;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String allergies;

    @Column(name = "chronic_diseases", columnDefinition = "NVARCHAR(MAX)")
    private String chronicDiseases;

    @Column(name = "treatment_history", columnDefinition = "NVARCHAR(MAX)")
    private String treatmentHistory;

    @Column(name = "vision_left", columnDefinition = "NVARCHAR(20)")
    private String visionLeft;

    @Column(name = "vision_right", columnDefinition = "NVARCHAR(20)")
    private String visionRight;

    @Column(name = "hearing_status", columnDefinition = "NVARCHAR(50)")
    private String hearingStatus;
    @Column(name = "dietary_restrictions", columnDefinition = "NVARCHAR(MAX)")
    private String dietaryRestrictions;

    @Column(name = "emergency_contact_info", columnDefinition = "NVARCHAR(100)")
    private String emergencyContactInfo;

    @Column(name = "immunization_status", columnDefinition = "NVARCHAR(MAX)")
    private String immunizationStatus;

    @Column(name = "last_physical_exam_date")
    private LocalDate lastPhysicalExamDate;
    @Column(name = "isActive")
    private Boolean isActive = true;

    @Column(name = "special_needs", columnDefinition = "NVARCHAR(MAX)")
    private String specialNeeds;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private List<Vaccination> vaccinations;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private List<MedicationInstruction> medicationInstructions;
}
