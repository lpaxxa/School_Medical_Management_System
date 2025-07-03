package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_notifications")
@Data
public class SystemNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(255)", nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "target_user_type", columnDefinition = "NVARCHAR(50)")
    private String targetUserType; // "PARENT", "NURSE", "ADMIN"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Reference to the parent receiving the notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Parent parent;

    // Reference to the student for context
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    // Reference to the health campaign if applicable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "health_campaign_id")
    private HealthCampaign healthCampaign;

    // Reference to medical checkup if applicable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_checkup_id")
    private MedicalCheckup medicalCheckup;

    @PrePersist
    protected void onCreate() {
        if (this.isRead == null) {
            this.isRead = false;
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Mark notification as read
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}