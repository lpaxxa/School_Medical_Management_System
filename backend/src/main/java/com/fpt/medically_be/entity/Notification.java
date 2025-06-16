package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "NVARCHAR(255)", nullable = false)
    private String title;
    @Column(columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String message;
    private Boolean isRequest;
    private LocalDateTime createdAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createdBy", nullable = false)
    private Nurse createdBy;

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NotificationRecipients> NotificationRecipients;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
