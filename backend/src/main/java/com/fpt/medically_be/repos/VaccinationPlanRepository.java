package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.VaccinationPlan;
import com.fpt.medically_be.entity.VaccinationPlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccinationPlanRepository extends JpaRepository<VaccinationPlan, Long> {

    // Tìm kiếm theo tên vaccine (không phân biệt chữ hoa/thường)
    List<VaccinationPlan> findByVaccineNameContainingIgnoreCase(String vaccineName);

    // Tìm kiếm theo trạng thái
    List<VaccinationPlan> findByStatus(VaccinationPlanStatus status);
}
