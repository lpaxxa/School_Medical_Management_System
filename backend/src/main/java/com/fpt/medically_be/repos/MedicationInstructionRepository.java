package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.MedicationInstruction;
import com.fpt.medically_be.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicationInstructionRepository extends JpaRepository<MedicationInstruction, Long> {
    List<MedicationInstruction> findByHealthProfileId(Long healthProfileId);
    List<MedicationInstruction> findByStatus(Status status);
    List<MedicationInstruction> findByEndDateBefore(LocalDate date);
    List<MedicationInstruction> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
    List<MedicationInstruction> findByParentProvided(Boolean parentProvided);
    List<MedicationInstruction> findByRequestedById(Long parentId);
}
