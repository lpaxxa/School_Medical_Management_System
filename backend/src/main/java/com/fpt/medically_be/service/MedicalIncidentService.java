package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.MedicalIncidentDTO;
import com.fpt.medically_be.entity.MedicalIncident;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface MedicalIncidentService {


    List<MedicalIncidentDTO> getAllMedicalIncidents();

    List<MedicalIncidentDTO> getFilteredIncidents(LocalDate startDate, LocalDate endDate, String severityLevel);

    MedicalIncidentDTO findMedicalIncidentDtoByIncidentId(Long id);

    MedicalIncidentDTO createMedicalIncident(MedicalIncidentDTO medicalIncidentDTO);

    MedicalIncidentDTO updateMedicalIncident(Long id, MedicalIncidentDTO medicalIncidentDTO);

    void deleteMedicalIncident(Long id);
    List<MedicalIncidentDTO> getMedicalIncidentsByStudentId(Long studentId);

    List<MedicalIncidentDTO> getMedicalIncidentsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    List<MedicalIncidentDTO> getMedicalIncidentsBySeverityLevel(String severityLevel);
    List<MedicalIncidentDTO> getMedicalIncidentsByStudentIdAndDateRange(Long studentId, LocalDateTime startDate, LocalDateTime endDate);

    List<MedicalIncidentDTO> getMedicalIncidentsNeedingFollowUp();

    List<MedicalIncidentDTO> getMedicalIncidentsByType(String incidentType);

    List<MedicalIncidentDTO> getMedicalIncidentsByStaffId(Long staffId);

    List<MedicalIncidentDTO> getMedicalIncidentsByStudentIdAndType(Long studentId, String incidentType);


    List<MedicalIncidentDTO> getMedicalIncidentsByStaffIdAndType(Long staffId, String incidentType);


}
