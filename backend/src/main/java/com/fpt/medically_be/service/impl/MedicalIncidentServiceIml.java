package com.fpt.medically_be.service.impl;


import com.fpt.medically_be.dto.MedicalIncidentDTO;
import com.fpt.medically_be.entity.MedicalIncident;
import com.fpt.medically_be.entity.MedicalStaff;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.mapper.MedicalIncidentMapper;
import com.fpt.medically_be.repos.MedicalIncidentRepository;
import com.fpt.medically_be.repos.MedicalStaffRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.MedicalIncidentService;
import org.apache.catalina.User;
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
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private MedicalStaffRepository medicalStaffRepository;


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

    @Override
    public MedicalIncidentDTO createMedicalIncident(MedicalIncidentDTO medicalIncidentDTO) {
        // Map DTO sang entity (các trường cơ bản)
        MedicalIncident incident = medicalIncidentMapper.toMedicalIncident(medicalIncidentDTO);


        if (medicalIncidentDTO.getStudentId() != null) {
            Student student = studentRepository.findById(medicalIncidentDTO.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found with id: " + medicalIncidentDTO.getStudentId()));
            incident.setStudent(student);
        } else {
            throw new RuntimeException("StudentId is required");
        }

        if (medicalIncidentDTO.getHandledById() != null) {
            MedicalStaff handledBy = medicalStaffRepository.findById(medicalIncidentDTO.getHandledById()).orElseThrow(() -> new RuntimeException("Medical Staff not found with id: " + medicalIncidentDTO.getHandledById()));

            incident.setHandledBy(handledBy);
        }

        MedicalIncident savedIncident = medicalIncidentRepository.save(incident);

        // Map lại entity thành DTO trả về
        return medicalIncidentMapper.toMedicalIncidentDto(savedIncident);
    }


    @Override
    public MedicalIncidentDTO updateMedicalIncident(Long id, MedicalIncidentDTO medicalIncidentDTO) {
        MedicalIncident medicalIncident = medicalIncidentRepository.findById(id).orElseThrow(() -> new RuntimeException("Medical Incident not found with id: " + id));

        if (!medicalStaffRepository.existsById(medicalIncidentDTO.getHandledById())) {
            throw new RuntimeException("HandledById không tồn tại");
        }
        if (!studentRepository.existsById(medicalIncidentDTO.getStudentId())) {
            throw new RuntimeException("StudentId không tồn tại");
        }

        medicalIncidentMapper.updateMedicalIncident(medicalIncident, medicalIncidentDTO);

        return medicalIncidentMapper.toMedicalIncidentDto(medicalIncident);
    }

    @Override
    public void deleteMedicalIncident(Long id) {

    }

    @Override
    public List<MedicalIncidentDTO> getMedicalIncidentsByStudentId(Long studentId) {
        return List.of();
    }

    @Override
    public List<MedicalIncidentDTO> getMedicalIncidentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return List.of();
    }

    @Override
    public List<MedicalIncidentDTO> getMedicalIncidentsBySeverityLevel(String severityLevel) {
        return List.of();
    }

    @Override
    public List<MedicalIncidentDTO> getMedicalIncidentsByStudentIdAndDateRange(Long studentId, LocalDateTime startDate, LocalDateTime endDate) {
        return List.of();
    }

    @Override
    public List<MedicalIncidentDTO> getMedicalIncidentsNeedingFollowUp() {
        return List.of();
    }

    @Override
    public List<MedicalIncidentDTO> getMedicalIncidentsByType(String incidentType) {
        return List.of();
    }

    @Override
    public List<MedicalIncidentDTO> getMedicalIncidentsByStaffId(Long staffId) {
        return List.of();
    }

    @Override
    public List<MedicalIncidentDTO> getMedicalIncidentsByStudentIdAndType(Long studentId, String incidentType) {
        return List.of();
    }

    @Override
    public List<MedicalIncidentDTO> getMedicalIncidentsByStaffIdAndType(Long staffId, String incidentType) {
        return List.of();
    }


}
