package com.fpt.medically_be.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "medical_incidents")
public class MedicalIncident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "incident_id")
    private Long incidentId;

    @Column(name = "incident_type", nullable = false ,columnDefinition = "NVARCHAR(150)")
    private String incidentType;

    @Column(name = "date_time")
    private LocalDateTime dateTime;

    @Column(name = "description", nullable = false ,columnDefinition = "NVARCHAR(250)")
    private String description;

    @Column(name = "symptoms",columnDefinition = "NVARCHAR(150)")
    private String symptoms;

    @Column(name = "severity_level", nullable = false ,columnDefinition = "NVARCHAR(150)")
    private String severityLevel;

    @Column(name = "treatment",columnDefinition = "NVARCHAR(150)")
    private String treatment;

    @Column(name = "medications_used" ,columnDefinition = "NVARCHAR(150)")
    private String medicationsUsed;

    @Column(name = "parent_notified")
    private Boolean parentNotified;

    @Column(name = "requires_follow_up")
    private Boolean requiresFollowUp;

    @Column(name = "follow_up_notes",columnDefinition = "NVARCHAR(150)")
    private String followUpNotes;

//    @Column(name = "created_at")
//    private LocalDateTime createdAt;


//    @Column(name = "updated_at", nullable = false)
//    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false) // trỏ đến Student.studentId
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by")
    private Nurse handledBy;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.dateTime == null) {
            this.dateTime = now;
        }
//        if (this.createdAt == null) {
//            this.createdAt = now;
//        }
//        this.updatedAt = now;
    }
//    @PreUpdate
//    protected void onUpdate() {
//        this.updatedAt = LocalDateTime.now();
//    }

    }



