package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table
public class NotificationRecipientVaccine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Gắn với một dòng NotificationRecipients (1 học sinh - 1 notification)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_recipient_id", nullable = false)
    private NotificationRecipients notificationRecipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccine_id", nullable = false)
    private Vaccine vaccine;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResponseStatus response = ResponseStatus.PENDING; // APPROVED, REJECTED, PENDING

    @Column(length = 400)
    private String parentNotes;


}
