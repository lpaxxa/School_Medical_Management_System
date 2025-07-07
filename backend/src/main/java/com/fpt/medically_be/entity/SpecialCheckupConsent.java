package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "special_checkup_consent")
@Data
public class SpecialCheckupConsent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_recipient_id", nullable = false)
    private NotificationRecipients notificationRecipient;

    @Enumerated(EnumType.STRING)
    @Column(name = "checkup_type", nullable = false)
    private SpecialCheckupType checkupType;

    @Column(name = "is_consented", columnDefinition = "BIT DEFAULT 0")
    private Boolean isConsented = false; // Mặc định là false (chưa đồng ý)

    @Column(name = "parent_note", columnDefinition = "NVARCHAR(500)")
    private String parentNote; // Ghi chú của phụ huynh (nếu có)

    @PrePersist
    protected void onCreate() {
        if (this.isConsented == null) {
            this.isConsented = false;
        }
    }
}
