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
}
