package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.MedicalCheckupDTO;
import java.time.LocalDateTime;
import java.util.List;

public interface MedicalCheckupService {
    List<MedicalCheckupDTO> getAllMedicalCheckups();
    MedicalCheckupDTO getMedicalCheckupById(Long id);
    List<MedicalCheckupDTO> getMedicalCheckupsByStudentId(Long studentId);
    List<MedicalCheckupDTO> getMedicalCheckupsByStaffId(Long staffId);
    List<MedicalCheckupDTO> getMedicalCheckupsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    List<MedicalCheckupDTO> getMedicalCheckupsByStudentAndDateRange(Long studentId, LocalDateTime startDate, LocalDateTime endDate);
    List<MedicalCheckupDTO> getMedicalCheckupsByType(String checkupType);
    List<MedicalCheckupDTO> getMedicalCheckupsNeedingFollowUp();
    MedicalCheckupDTO createMedicalCheckup(MedicalCheckupDTO medicalCheckupDTO);
    MedicalCheckupDTO updateMedicalCheckup(Long id, MedicalCheckupDTO medicalCheckupDTO);
    void deleteMedicalCheckup(Long id);

}
