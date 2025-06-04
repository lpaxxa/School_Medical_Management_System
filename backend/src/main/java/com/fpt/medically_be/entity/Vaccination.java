package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "vaccinations")
@Data
public class Vaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "health_profile_id", nullable = false)
    private HealthProfile healthProfile;

    @Column(name = "vaccine_name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String vaccineName;

    @Column(name = "vaccination_date")
    private LocalDate vaccinationDate;

    @Column(name = "next_dose_date")
    private LocalDate nextDoseDate;

    @Column(name = "dose_number")
    private Integer doseNumber;

    @Column(name = "administered_by", columnDefinition = "NVARCHAR(255)")
    private String administeredBy;

    @Column(name = "administered_at", columnDefinition = "NVARCHAR(255)")
    private String administeredAt;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @Column(name = "parent_consent")
    private Boolean parentConsent;
}
