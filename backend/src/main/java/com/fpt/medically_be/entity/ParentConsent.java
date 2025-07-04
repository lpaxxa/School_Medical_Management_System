package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "parent_consents")
@Data
public class ParentConsent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "health_campaign_id", nullable = false)
    private HealthCampaign healthCampaign;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private AccountMember parent;

    @Column(name = "consent_given", nullable = false)
    private Boolean consentGiven = false;

    @Column(name = "consent_date")
    private LocalDateTime consentDate;

    @Column(name = "special_checkup_items", columnDefinition = "NVARCHAR(MAX)")
    private String specialCheckupItems; // JSON string chứa các mục khám đặc biệt

    @Column(name = "parent_notes", columnDefinition = "NVARCHAR(MAX)")
    private String parentNotes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
