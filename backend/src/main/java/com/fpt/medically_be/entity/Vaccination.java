package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccinations")
@Data
public class Vaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "health_profile_id", nullable = false)
    private HealthProfile healthProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccine_id", nullable = false)
    private Vaccine vaccine;

    // Kế hoạch (null nếu phụ huynh tự khai)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_plan_id")
    private VaccinationPlan vaccinationPlan;

    @Column(name = "vaccination_date")
    private LocalDateTime vaccinationDate;

    @Column(name = "dose_number")
    private Integer doseNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nurse_id")
    private Nurse nurse;

    @Column(name = "administered_at", columnDefinition = "NVARCHAR(255)")
    private String administeredAt;

    // === THÔNG TIN PHẢN HỒI PHỤ HUYNH ===
//    @Enumerated(EnumType.STRING)
//    @Column(name = "parent_response_status")
//    private ResponseStatus parentResponseStatus; // APPROVED, REJECTED, PENDING, NOT_REQUIRED
//
//    @Column(name = "parent_responded_at")
//    private LocalDateTime parentRespondedAt;

    @Column(name = "parent_notes", columnDefinition = "NVARCHAR(MAX)")
    private String parentNotes;

    // === THÔNG TIN BỔ SUNG ===
    @Enumerated(EnumType.STRING)
    @Column(name = "vaccination_type")
    private VaccinationType vaccinationType;

    @Column(name = "next_dose_date")
    private LocalDate nextDoseDate;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


}
