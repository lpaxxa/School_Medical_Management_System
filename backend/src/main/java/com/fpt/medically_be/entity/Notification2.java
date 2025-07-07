package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "notifications")
@Data
public class Notification2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "NVARCHAR(255)", nullable = false)
    private String title;
    @Column(columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String message;
    private Boolean isRequest;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createdBy")
    private Nurse createdBy;
    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private NotificationType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_plan_id")
    private VaccinationPlan vaccinationPlan; // null nếu thông báo chung

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NotificationRecipients> NotificationRecipients;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
