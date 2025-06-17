package com.fpt.medically_be.service.impl;


import com.fpt.medically_be.dto.response.MedicalIncidentStudentDTO;
import com.fpt.medically_be.entity.MedicalIncident;
import com.fpt.medically_be.entity.Nurse;
import com.fpt.medically_be.entity.Student;

import com.fpt.medically_be.dto.request.MedicationUsedDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentResponseDTO;
import com.fpt.medically_be.dto.request.MedicalIncidentCreateDTO;

import com.fpt.medically_be.entity.*;


import com.fpt.medically_be.mapper.MedicalIncidentMapper;
import com.fpt.medically_be.repos.MedicalIncidentRepository;
import com.fpt.medically_be.repos.MedicationItemsRepository;
import com.fpt.medically_be.repos.NurseRepository;

import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.MedicalIncidentService;



import jakarta.transaction.Transactional;

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
    private StudentRepository studentRepository;
    @Autowired
    private NurseRepository nurseRepository;
    @Autowired
    private MedicationItemsRepository medicationItemsRepository;
    @Autowired
    private MedicalIncidentRepository medicalIncidentRepository;
    @Autowired
    private MedicalIncidentMapper medicalIncidentMapper;


    @Override
    public List<MedicalIncidentResponseDTO> getAllMedicalIncidents() {
        return medicalIncidentRepository.findAll()
                .stream()
                .map(medicalIncidentMapper::toMedicalIncidentDto)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalIncidentResponseDTO findMedicalIncidentDtoByIncidentId(Long id) {
        return medicalIncidentRepository.findById(id)
                .map(medicalIncidentMapper::toMedicalIncidentDto)
                .orElseThrow(() -> new RuntimeException("Medical Incident not found with id: " + id));
    }

    @Override
    public boolean deleteMedicalIncidentById(Long id) {
        // Hoàn trả tồn kho thuốc trước khi xóa
//        for (MedicationUsed medUsed : incident.getMedications()) {
//            MedicationItems item = medUsed.getItemID();
//            item.setStockQuantity(item.getStockQuantity() + medUsed.getQuantityUsed());
//            medicationItemsRepository.save(item); // Cập nhật lại kho
//        }

        if(medicalIncidentRepository.existsById(id)) {
            medicalIncidentRepository.deleteById(id);
            return true;
        } else {
            throw new RuntimeException("Medical Incident not found with id: " + id);

        }

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
                .map(medicalIncidentMapper::toMedicalIncidentDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalIncidentResponseDTO> getTypesOfMedicalIncidents(String type) {

        List<MedicalIncident> incidents = medicalIncidentRepository.findMedicalIncidentByIncidentTypeContainingIgnoreCase(type);
        if (incidents.isEmpty()) {
            throw new RuntimeException("No medical incidents found for type: " + type);
        }
        return incidents.stream()
                .map(medicalIncidentMapper::toMedicalIncidentDto)
                .collect(Collectors.toList());

    }


    @Override
    public List<MedicalIncidentResponseDTO> getMedicalIncidentsByRequiresFollowUp(boolean requiresFollowUp) {
        List<MedicalIncident> incidents = medicalIncidentRepository.findMedicalIncidentByRequiresFollowUp(requiresFollowUp);

        if (incidents.isEmpty()) {
            throw new RuntimeException("No medical incidents found with requiresFollowUp = " + requiresFollowUp);
        }

        return incidents.stream()
                .map(medicalIncidentMapper::toMedicalIncidentDto)
                .collect(Collectors.toList());
    }


    @Override
    public MedicalIncidentStudentDTO getMedicalIncidentDetails(Long incidentId) {

        MedicalIncident incident = medicalIncidentRepository.findById(incidentId).orElseThrow(()
                -> new RuntimeException("Medical Incident not found with id: " + incidentId));

        MedicalIncidentStudentDTO incidentDetails = medicalIncidentMapper.toMedicalIncidentStudentDTO(incident);

        return incidentDetails;

    }




    // create
    @Override
    public MedicalIncidentResponseDTO createMedicalIncident(MedicalIncidentCreateDTO medicalIncidentCreateDTO) {
        MedicalIncident incident = medicalIncidentMapper.toMedicalIncidentCreate(medicalIncidentCreateDTO);

        // Kiểm tra và set thông tin Student
        if (medicalIncidentCreateDTO.getStudentId() != null) {
            Student student = studentRepository.findById(medicalIncidentCreateDTO.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found with id: " + medicalIncidentCreateDTO.getStudentId()));
            incident.setStudent(student);
        } else {
            throw new RuntimeException("StudentId is required");
        }

        // Kiểm tra và set thông tin Nurse
        if (medicalIncidentCreateDTO.getHandledById() != null) {
            Nurse handledBy = nurseRepository.findById(medicalIncidentCreateDTO.getHandledById())
                    .orElseThrow(() -> new RuntimeException("Medical Staff not found with id: "
                            + medicalIncidentCreateDTO.getHandledById()));
            incident.setHandledBy(handledBy);
        }

        List<MedicationUsedDTO> medicationRequests = medicalIncidentCreateDTO.getMedicationsUsed();

        if (medicationRequests != null && !medicationRequests.isEmpty()) {
            List<MedicationUsed> medicationUsedList = new ArrayList<>();

            for (MedicationUsedDTO medReq : medicationRequests) {
                if (medReq.getQuantityUsed() > 0 && medReq.getItemID() > 0) {
                    MedicationItems medicationItem = medicationItemsRepository.findById(medReq.getItemID())
                            .orElseThrow(() -> new RuntimeException("Medication Item not found with id: " + medReq.getItemID()));

                    //  Kiểm tra số lượng tồn kho
                    if (medicationItem.getStockQuantity() < medReq.getQuantityUsed()) {
                        throw new RuntimeException("Not enough stock for item: " + medicationItem.getItemName() +
                                ". Available: " + medicationItem.getStockQuantity() +
                                ", Required: " + medReq.getQuantityUsed());
                    }

                    // Trừ số lượng thuốc trong kho
                    medicationItem.setStockQuantity(medicationItem.getStockQuantity() - medReq.getQuantityUsed());
                    medicationItemsRepository.save(medicationItem); // Cập nhật lại kho

                    MedicationUsed medicationUsed = new MedicationUsed();
                    medicationUsed.setItemID(medicationItem);
                    medicationUsed.setQuantityUsed(medReq.getQuantityUsed());
                    medicationUsed.setIncidentId(incident);
                    medicationUsedList.add(medicationUsed);
                } else {
                    throw new RuntimeException("Medication item ID và quantity phải hợp lệ");
                }
            }

            incident.setMedications(medicationUsedList);
        }

        MedicalIncident savedIncident = medicalIncidentRepository.save(incident);
        return medicalIncidentMapper.toMedicalIncidentDto(savedIncident);

    }




    // update
                @Transactional
                @Override
                public MedicalIncidentResponseDTO updateMedicalIncident(Long id, MedicalIncidentCreateDTO dto) {
                    MedicalIncident incident = medicalIncidentRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Medical Incident not found with id: " + id));

                    Student student = studentRepository.findById(dto.getStudentId())
                            .orElseThrow(() -> new RuntimeException("Student not found with id: " + dto.getStudentId()));

                    Nurse nurse = nurseRepository.findById(dto.getHandledById())
                            .orElseThrow(() -> new RuntimeException("Nurse not found with id: " + dto.getHandledById()));

                    // Cập nhật quan hệ
                    incident.setStudent(student);
                    incident.setHandledBy(nurse);

                    // --- Hoàn trả tồn kho thuốc cũ trước khi xóa ---
                    for (MedicationUsed oldMed : incident.getMedications()) {
                        MedicationItems item = oldMed.getItemID();
                        item.setStockQuantity(item.getStockQuantity() + oldMed.getQuantityUsed());
                    }

                    // Xóa thuốc cũ (orphanRemoval sẽ tự xóa)
                    incident.getMedications().clear();

                    // --- Thêm thuốc mới, trừ tồn kho ---
                    List<MedicationUsedDTO> medDTOs = dto.getMedicationsUsed();
                    if (medDTOs != null && !medDTOs.isEmpty()) {
                        // KHÔNG tạo list mới, thêm trực tiếp vào collection hiện tại
                        for (MedicationUsedDTO medDTO : medDTOs) {
                            MedicationItems item = medicationItemsRepository.findById(medDTO.getItemID())
                                    .orElseThrow(() -> new RuntimeException("Medication Item not found with id: " + medDTO.getItemID()));

                            if (item.getStockQuantity() < medDTO.getQuantityUsed()) {
                                throw new RuntimeException("Not enough stock for item: " + item.getItemName());
                            }

                            // Trừ tồn kho
                            item.setStockQuantity(item.getStockQuantity() - medDTO.getQuantityUsed());

                            MedicationUsed used = new MedicationUsed();
                            used.setItemID(item);
                            used.setQuantityUsed(medDTO.getQuantityUsed());
                            used.setIncidentId(incident);

                            // Thêm vào collection hiện có (không gán mới)
                            incident.getMedications().add(used);
                        }
                    }

                    // Cập nhật các trường còn lại từ DTO
                    medicalIncidentMapper.updateMedicalIncident(incident, dto);

                    return medicalIncidentMapper.toMedicalIncidentDto(incident);
                }





                }