package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "health_campaigns")
@Data
public class HealthCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    // Danh sách các mục kiểm tra đặc biệt của chiến dịch - lưu dưới dạng JSON
    @Column(name = "special_checkup_items", columnDefinition = "NVARCHAR(MAX)")
    private String specialCheckupItems;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HealthCampaignStatus status;

    // Mối quan hệ với ParentConsent
    @OneToMany(mappedBy = "healthCampaign", cascade = CascadeType.ALL)
    private List<ParentConsent> parentConsents = new ArrayList<>();

    // Mối quan hệ với MedicalCheckup
    @OneToMany(mappedBy = "healthCampaign", cascade = CascadeType.ALL)
    private List<MedicalCheckup> medicalCheckups = new ArrayList<>();

    @Column(name = "created_at")
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

    // Helper method để thêm ParentConsent
    public void addParentConsent(ParentConsent consent) {
        parentConsents.add(consent);
        consent.setHealthCampaign(this);
    }

    // Helper method để thêm MedicalCheckup
    public void addMedicalCheckup(MedicalCheckup checkup) {
        medicalCheckups.add(checkup);
        checkup.setHealthCampaign(this);
    }
}
