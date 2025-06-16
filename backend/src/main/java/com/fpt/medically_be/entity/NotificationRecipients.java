package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "NotificationRecipients")
@Data
public class NotificationRecipients {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notificationID", nullable = false)
    private Notification notification;

    @Enumerated(EnumType.STRING)
    private ResponseStatus response;
    private LocalDateTime responseAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiverID", nullable = false)
    private Parent receiver;

}
