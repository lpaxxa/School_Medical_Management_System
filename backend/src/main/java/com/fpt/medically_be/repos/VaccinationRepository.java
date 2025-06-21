package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByHealthProfileId(Long healthProfileId);
    List<Vaccination> findByVaccineName(String vaccineName);
    List<Vaccination> findByVaccinationDateBetween(LocalDate startDate, LocalDate endDate);
    List<Vaccination> findByNextDoseDateBefore(LocalDate date);
    List<Vaccination> findByParentConsent(Boolean parentConsent);

    // dt
    List<Vaccination> findByHealthProfile_Student_Parent_Id(Long id);

    //List<Vaccination> findByHealthProfile_Student_Id(Long id);
}
