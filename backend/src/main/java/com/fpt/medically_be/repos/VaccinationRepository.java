package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.entity.Vaccination;
import com.fpt.medically_be.entity.Vaccine;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByHealthProfileId(Long healthProfileId);
    List<Vaccination> findByVaccineName(String vaccineName);
    List<Vaccination> findByNextDoseDateBefore(LocalDate date);

    // dt
    List<Vaccination> findByHealthProfile_Student_Parent_Id(Long id);
    int countByHealthProfile_IdAndVaccine_Id(Long healthProfileId, Long vaccineId);
//    Integer findMaxDoseNumberByHealthProfileAndVaccine(HealthProfile profile, Vaccine vaccine);

    @Query("SELECT MAX(v.doseNumber) FROM Vaccination v WHERE v.healthProfile.id = :profileId AND v.vaccine.id = :vaccineId")
    Integer findMaxDoseNumberByHealthProfileIdAndVaccineId(@Param("profileId") Long profileId, @Param("vaccineId") Long vaccineId);

    List<Vaccination> findByHealthProfile_Student_IdOrderByVaccinationDateDesc(Long studentId);

}
