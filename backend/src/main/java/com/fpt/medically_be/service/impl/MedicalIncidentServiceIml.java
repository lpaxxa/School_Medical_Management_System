package com.fpt.medically_be.service.impl;


import com.fpt.medically_be.dto.response.MedicalIncidentResponseDTO;
import com.fpt.medically_be.dto.request.MedicalIncidentCreateDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentStudentDTO;
import com.fpt.medically_be.entity.MedicalIncident;
import com.fpt.medically_be.entity.Nurse;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.mapper.MedicalIncidentMapper;
import com.fpt.medically_be.repos.MedicalIncidentRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.StudentRepository;
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
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private NurseRepository nurseRepository;




    @Override
    public List<MedicalIncidentResponseDTO> getAllMedicalIncidents() {
        return medicalIncidentRepository.findAll()
                .stream()
                .map(medicalIncidentMapper::toMedicalIncidentResponseDto)
                .collect(Collectors.toList());
    }



    @Override
    public List<MedicalIncidentResponseDTO> getFilteredIncidents(LocalDate startDate, LocalDate endDate, String severityLevel) {

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
                .map(medicalIncidentMapper::toMedicalIncidentResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalIncidentResponseDTO findMedicalIncidentDtoByIncidentId(Long id) {
        return medicalIncidentRepository.findById(id)
                .map(medicalIncidentMapper::toMedicalIncidentResponseDto)
                .orElseThrow(() -> new RuntimeException("Medical Incident not found with id: " + id));
    }

    @Override
    public MedicalIncidentResponseDTO createMedicalIncident(MedicalIncidentCreateDTO medicalIncidentCreateDTO) {
        // Map DTO sang entity (các trường cơ bản)
        MedicalIncident incident = medicalIncidentMapper.toMedicalIncidentCreate(medicalIncidentCreateDTO);


        if (medicalIncidentCreateDTO.getStudentId() != null) {
            Student student = studentRepository.findById(medicalIncidentCreateDTO.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found with id: " + medicalIncidentCreateDTO.getStudentId()));
            incident.setStudent(student);
        } else {
            throw new RuntimeException("StudentId is required");
        }

        if (medicalIncidentCreateDTO.getHandledById() != null) {
            Nurse handledBy = nurseRepository.findById(medicalIncidentCreateDTO.getHandledById())
                    .orElseThrow(() -> new RuntimeException("Medical Staff not found with id: "
                            + medicalIncidentCreateDTO.getHandledById()));

            incident.setHandledBy(handledBy);
        }

        MedicalIncident savedIncident = medicalIncidentRepository.save(incident);

        // Map lại entity thành DTO trả về
        return medicalIncidentMapper.toMedicalIncidentResponseDto(savedIncident);
    }





    @Override
    public MedicalIncidentResponseDTO updateMedicalIncident(Long id, MedicalIncidentCreateDTO medicalIncidentCreateDTO) {
        MedicalIncident medicalIncident = medicalIncidentRepository.findById(id).orElseThrow(() -> new RuntimeException("Medical Incident not found with id: " + id));

        if (!nurseRepository.existsById(medicalIncidentCreateDTO.getHandledById())) {
            throw new RuntimeException("HandledById không tồn tại");
        }
        if (!studentRepository.existsById(medicalIncidentCreateDTO.getStudentId())) {
            throw new RuntimeException("StudentId không tồn tại");
        }

        medicalIncidentMapper.updateMedicalIncident(medicalIncident, medicalIncidentCreateDTO);

        return medicalIncidentMapper.toMedicalIncidentResponseDto(medicalIncident);
    }

    @Override
    public void deleteMedicalIncident(Long id) {

        if(!medicalIncidentRepository.existsById(id)) {
            throw new RuntimeException("Medical Incident not found with id: " + id);
        }
        medicalIncidentRepository.deleteById(id);
    }

    @Override
    public List<MedicalIncidentStudentDTO> getMedicalIncidentDetails(Long studentId) {

        MedicalIncident medicalIncident = medicalIncidentRepository.findByIncidentId(studentId)
                .orElseThrow(() -> new RuntimeException("Medical Incident not found with id: " + studentId));

        return medicalIncidentRepository.findByIncidentId(studentId)
                .stream()
                .map(medicalIncidentMapper::toMedicalIncidentStudentDTO)
                .collect(Collectors.toList());

    }






}
