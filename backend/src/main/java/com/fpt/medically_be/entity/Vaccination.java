package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccinations")
@Data
public class Vaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "health_profile_id", nullable = false)
    private HealthProfile healthProfile;

    @Column(name = "vaccine_name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String vaccineName;

    @Column(name = "vaccination_date")
    private LocalDateTime vaccinationDate;

    @Column(name = "next_dose_date")
    private LocalDate nextDoseDate;

    @Column(name = "dose_number")
    private Integer doseNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nurse_id")
    private Nurse nurse;

    @Column(name = "administered_at", columnDefinition = "NVARCHAR(255)")
    private String administeredAt;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_recipient_id")
    private NotificationRecipients notificationRecipient;
}
