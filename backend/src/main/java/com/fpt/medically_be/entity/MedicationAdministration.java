package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "medication_administrations")
@Data
public class MedicationAdministration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Reference to the approved medication instruction
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_instruction_id", nullable = false)
    private MedicationInstruction medicationInstruction;
    
    // Which nurse administered it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "administered_by", nullable = false)
    private Nurse administeredBy;


    
    // When was it administered
    @Column(name = "administered_at", nullable = false)
    private LocalDateTime administeredAt;
    
    // Status of administration
    @Enumerated(EnumType.STRING)
    @Column(name = "administration_status", nullable = false)
//    private AdministrationStatus administrationStatus;
    private Status administrationStatus;

    // Combined notes: dosage given, student response, side effects, etc.
    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;
    
    // URL of confirmation image
    @Column(name = "confirmation_image_url", columnDefinition = "NVARCHAR(255)")
    private String confirmationImageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}

