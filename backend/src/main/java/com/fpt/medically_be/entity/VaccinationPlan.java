package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vaccination_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Trong VaccinationPlan.java
    @ManyToMany
    @JoinTable(
            name = "vaccination_plan_vaccines",
            joinColumns = @JoinColumn(name = "vaccination_plan_id"),
            inverseJoinColumns = @JoinColumn(name = "vaccine_id")
    )
    private List<Vaccine> vaccines;

    @Column(name = "vaccination_date", nullable = false)
    private LocalDate vaccinationDate;

//    @Column(name = "dose_number") // Mũi thứ mấy
//    private Integer doseNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private VaccinationPlanStatus status = VaccinationPlanStatus.WAITING_PARENT;

    @Column(name = "plan_name", columnDefinition = "NVARCHAR(255)")
    private String name;
    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "deadline_date")
    private LocalDateTime deadlineDate; // Hạn phản hồi phụ huynh

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "vaccinationPlan", cascade = CascadeType.ALL)
    private List<Vaccination> vaccinations;

    @OneToMany(mappedBy = "vaccinationPlan", cascade = CascadeType.ALL)
    private List<Notification2> notifications;

}
