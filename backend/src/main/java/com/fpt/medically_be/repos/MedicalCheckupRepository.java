package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.MedicalCheckup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicalCheckupRepository extends JpaRepository<MedicalCheckup, Long> {
    List<MedicalCheckup> findByStudentId(Long studentId);
    List<MedicalCheckup> findByMedicalStaffId(Long staffId);
    List<MedicalCheckup> findByCheckupDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<MedicalCheckup> findByStudentIdAndCheckupDateBetween(Long studentId, LocalDateTime startDate, LocalDateTime endDate);
    List<MedicalCheckup> findByCheckupType(String checkupType);
    List<MedicalCheckup> findByFollowUpNeeded(Boolean followUpNeeded);
}
