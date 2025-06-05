package com.fpt.medically_be.service.impl;


import com.fpt.medically_be.dto.MedicalIncidentDTO;
import com.fpt.medically_be.entity.MedicalIncident;
import com.fpt.medically_be.mapper.MedicalIncidentMapper;
import com.fpt.medically_be.repos.MedicalIncidentRepository;
import com.fpt.medically_be.service.MedicalIncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;



@Service
public class MedicalIncidentServiceIml implements MedicalIncidentService {

    @Autowired
    MedicalIncidentMapper medicalIncidentMapper;
    @Autowired
    private MedicalIncidentRepository medicalIncidentRepository;
    @Override
    public List<MedicalIncidentDTO> getAllMedicalIncidents() {
        return medicalIncidentRepository.findAll()
                .stream()
                .map(medicalIncidentMapper::toMedicalIncidentDto)
                .collect(Collectors.toList());
    }



    @Override
    public List<MedicalIncidentDTO> getFilteredIncidents(LocalDate startDate, LocalDate endDate, String severityLevel) {

        List<MedicalIncident> incidents = new ArrayList<>();

        if (startDate != null && endDate != null && severityLevel != null) {
            incidents = medicalIncidentRepository.findByDateTimeBetweenAndSeverityLevel(
                    startDate.atStartOfDay(),
                    endDate.atTime(23, 59, 59),
                    severityLevel
            );
        } else if (startDate != null && endDate != null) {
            incidents = medicalIncidentRepository.findByDateTimeBetween(
                    startDate.atStartOfDay(),
                    endDate.atTime(23, 59, 59)
            );
        } else if (severityLevel != null) {
            incidents = medicalIncidentRepository.findBySeverityLevel(severityLevel);
        } else {
            incidents = medicalIncidentRepository.findAll();
        }
        return incidents.stream()
                .map(medicalIncidentMapper::toMedicalIncidentDto)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalIncidentDTO findMedicalIncidentDtoByIncidentId(Long id) {
        return medicalIncidentRepository.findById(id)
                .map(medicalIncidentMapper::toMedicalIncidentDto)
                .orElseThrow(() -> new RuntimeException("Medical Incident not found with id: " + id));
    }

}
