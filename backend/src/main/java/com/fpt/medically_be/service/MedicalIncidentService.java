package com.fpt.medically_be.service;





import com.fpt.medically_be.dto.request.MedicalIncidentCreateDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentResponseDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentStudentDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


public interface MedicalIncidentService {

    List<MedicalIncidentResponseDTO> getAllMedicalIncidents();

    List<MedicalIncidentResponseDTO> getFilteredIncidents(LocalDate startDate, LocalDate endDate, String severityLevel);

    MedicalIncidentResponseDTO findMedicalIncidentDtoByIncidentId(Long id);

    boolean deleteMedicalIncidentById(Long id);


    List<MedicalIncidentResponseDTO> getTypesOfMedicalIncidents(String incidentType);

    List<MedicalIncidentResponseDTO> getMedicalIncidentsByRequiresFollowUp(boolean requiredFollowUpNotes);

    MedicalIncidentResponseDTO updateMedicalIncident( Long id, MedicalIncidentCreateDTO medicalIncidentDTO);

    MedicalIncidentResponseDTO createMedicalIncident(MedicalIncidentCreateDTO medicalIncidentDTO);

    MedicalIncidentStudentDTO getMedicalIncidentDetails(Long incidentId);


   List<MedicalIncidentResponseDTO> getMedicalIncidentByStudentID(Long id);

    }
