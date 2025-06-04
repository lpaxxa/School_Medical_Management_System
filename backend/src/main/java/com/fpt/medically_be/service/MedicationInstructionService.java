package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.MedicationInstructionDTO;
import java.time.LocalDate;
import java.util.List;

public interface MedicationInstructionService {
    List<MedicationInstructionDTO> getAllMedicationInstructions();
    MedicationInstructionDTO getMedicationInstructionById(Long id);
    List<MedicationInstructionDTO> getMedicationInstructionsByHealthProfileId(Long healthProfileId);
    List<MedicationInstructionDTO> getMedicationInstructionsByStatus(String status);
    List<MedicationInstructionDTO> getExpiredMedicationInstructions(LocalDate date);
    List<MedicationInstructionDTO> getMedicationInstructionsByDateRange(LocalDate startDate, LocalDate endDate);
    List<MedicationInstructionDTO> getParentProvidedMedicationInstructions(Boolean parentProvided);
    MedicationInstructionDTO createMedicationInstruction(MedicationInstructionDTO medicationInstructionDTO);
    MedicationInstructionDTO updateMedicationInstruction(Long id, MedicationInstructionDTO medicationInstructionDTO);
    void deleteMedicationInstruction(Long id);
}
