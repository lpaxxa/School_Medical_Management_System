package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.response.MedicalIncidentResponseDTO;
import com.fpt.medically_be.dto.request.MedicalIncidentCreateDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentStudentDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface MedicalIncidentService {


    List<MedicalIncidentResponseDTO> getAllMedicalIncidents();

    List<MedicalIncidentResponseDTO> getFilteredIncidents(LocalDate startDate, LocalDate endDate, String severityLevel);

    MedicalIncidentResponseDTO findMedicalIncidentDtoByIncidentId(Long id);

    MedicalIncidentResponseDTO createMedicalIncident(MedicalIncidentCreateDTO medicalIncidentDTO);

    MedicalIncidentResponseDTO updateMedicalIncident(Long id, MedicalIncidentCreateDTO medicalIncidentResponseDTO);

    void deleteMedicalIncident(Long id);
    List<MedicalIncidentStudentDTO> getMedicalIncidentDetails(Long studentId);



}
