package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "health_profiles")
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

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private List<Vaccination> vaccinations;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private List<MedicationInstruction> medicationInstructions;
}
