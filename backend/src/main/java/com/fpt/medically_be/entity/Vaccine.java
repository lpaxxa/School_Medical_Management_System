
package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// 1. Vaccine Entity
@Entity
@Table(name = "vaccines")
@Data
public class Vaccine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "total_doses", nullable = false) // Tổng số mũi cần tiêm
    private Integer totalDoses;

    @Column(name = "interval_days") // Khoảng cách giữa các mũi (ngày)
    private Integer intervalDays;

    @Column(name = "min_age_months") // Tuổi tối thiểu (tháng)
    private Integer minAgeMonths;

    @Column(name = "max_age_months") // Tuổi tối đa (tháng)
    private Integer maxAgeMonths;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "vaccine", cascade = CascadeType.ALL)
    private List<Vaccination> vaccinations;

    @OneToMany(mappedBy = "vaccine", cascade = CascadeType.ALL)
    private List<VaccinationPlan> vaccinationPlans;

}