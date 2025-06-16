package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.MedicationRequestDTO;
import com.fpt.medically_be.dto.request.NurseMedicationApprovalRequestDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.dto.response.ParentDTO;
import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.repos.MedicationInstructionRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.ParentRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.MedicationInstructionService;
import com.fpt.medically_be.service.ParentService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MedicationInstructionServiceImpl implements MedicationInstructionService {

    private final MedicationInstructionRepository medicationInstructionRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final StudentRepository studentRepository;
    private final ParentService parentService;
    private final ParentRepository parentRepository;
    private final NurseRepository nurseRepository;

    @Autowired
    public MedicationInstructionServiceImpl(MedicationInstructionRepository medicationInstructionRepository,
                                            HealthProfileRepository healthProfileRepository,
                                            StudentRepository studentRepository, ParentService parentService, 
                                            ParentRepository parentRepository, NurseRepository nurseRepository) {
        this.medicationInstructionRepository = medicationInstructionRepository;
        this.healthProfileRepository = healthProfileRepository;
        this.studentRepository = studentRepository;
        this.parentService = parentService;
        this.parentRepository = parentRepository;
        this.nurseRepository = nurseRepository;
    }

    @Override
    public List<MedicationInstructionDTO> getAllMedicationInstructions() {
        return medicationInstructionRepository.findAll().stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public MedicationInstructionDTO getMedicationInstructionById(Long id) {
        return medicationInstructionRepository.findById(id)
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hướng dẫn thuốc với ID: " + id));
    }

    @Override
    public List<MedicationInstructionDTO> getMedicationInstructionsByHealthProfileId(Long healthProfileId) {
        return medicationInstructionRepository.findByHealthProfileId(healthProfileId).stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getMedicationInstructionsByStatus(Status status) {
        return medicationInstructionRepository.findByStatus(status).stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getExpiredMedicationInstructions(LocalDate date) {
        return medicationInstructionRepository.findByEndDateBefore(date).stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getMedicationInstructionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return medicationInstructionRepository.findByStartDateBetween(startDate, endDate).stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getParentProvidedMedicationInstructions(Boolean parentProvided) {
        return medicationInstructionRepository.findByParentProvided(parentProvided).stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public MedicationInstructionDTO createMedicationInstruction(MedicationInstructionDTO medicationInstructionDTO) {
        // Convert DTO to entity
        MedicationInstruction medicationInstruction = new MedicationInstructionDTO().toEntity(medicationInstructionDTO);

        // Set the health profile relationship
        if (medicationInstructionDTO.getHealthProfileId() != null) {
            HealthProfile healthProfile = healthProfileRepository.findById(medicationInstructionDTO.getHealthProfileId())
                    .orElseThrow(() -> new EntityNotFoundException("Health profile not found"));
            medicationInstruction.setHealthProfile(healthProfile);
        }

        // Save and return
        MedicationInstruction savedMedicationInstruction = medicationInstructionRepository.save(medicationInstruction);
        return new MedicationInstructionDTO().toObject(savedMedicationInstruction);
    }

    @Override
    public MedicationInstructionDTO updateMedicationInstruction(Long id, MedicationInstructionDTO medicationInstructionDTO) {
        MedicationInstruction existingMedicationInstruction = medicationInstructionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hướng dẫn thuốc với ID: " + id));

        // Cập nhật thông tin hướng dẫn thuốc
        existingMedicationInstruction.setMedicationName(medicationInstructionDTO.getMedicationName());
        existingMedicationInstruction.setDosageInstructions(medicationInstructionDTO.getDosageInstructions());
        existingMedicationInstruction.setStartDate(medicationInstructionDTO.getStartDate());
        existingMedicationInstruction.setEndDate(medicationInstructionDTO.getEndDate());
        existingMedicationInstruction.setFrequencyPerDay(medicationInstructionDTO.getFrequencyPerDay());
        existingMedicationInstruction.setTimeOfDay(medicationInstructionDTO.getTimeOfDay());
        existingMedicationInstruction.setSpecialInstructions(medicationInstructionDTO.getSpecialInstructions());
        existingMedicationInstruction.setParentProvided(medicationInstructionDTO.getParentProvided());
        existingMedicationInstruction.setSubmittedAt(medicationInstructionDTO.getSubmittedAt());

        // Cập nhật health profile nếu có thay đổi
        if (medicationInstructionDTO.getHealthProfileId() != null &&
                !medicationInstructionDTO.getHealthProfileId().equals(existingMedicationInstruction.getHealthProfile().getId())) {
            HealthProfile healthProfile = healthProfileRepository.findById(medicationInstructionDTO.getHealthProfileId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe với ID: " + medicationInstructionDTO.getHealthProfileId()));
            existingMedicationInstruction.setHealthProfile(healthProfile);
        }

        MedicationInstruction updatedMedicationInstruction = medicationInstructionRepository.save(existingMedicationInstruction);
        return new MedicationInstructionDTO().toObject(updatedMedicationInstruction);
    }

    @Override
    public void deleteMedicationInstruction(Long id) {
        if (!medicationInstructionRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy hướng dẫn thuốc với ID: " + id);
        }
        medicationInstructionRepository.deleteById(id);
    }

    @Override
    public MedicationInstructionDTO createParentMedicationRequest(MedicationRequestDTO request, Authentication auth) {
        ParentDTO currentParent = parentService.getCurretParent(auth);
        parentService.validateParentOwnsStudent(request.getStudentId(), auth);
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy học sinh với ID: " + request.getStudentId()));
        HealthProfile healthProfile = student.getHealthProfile();
        if (healthProfile == null) {
            throw new EntityNotFoundException("Học sinh không có hồ sơ sức khỏe.");
        }
        
        // Get the Parent entity to set requestedBy relationship
        Parent parentEntity = parentRepository.findById(currentParent.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phụ huynh với ID: " + currentParent.getId()));
        
        MedicationInstruction medicationInstruction = new MedicationInstruction();
        medicationInstruction.setMedicationName(request.getMedicineName());
        medicationInstruction.setDosageInstructions(request.getDosage());
        medicationInstruction.setStartDate(request.getStartDate());
        medicationInstruction.setEndDate(request.getEndDate());
        medicationInstruction.setFrequencyPerDay(request.getFrequency());
        
        // Convert timeToTake list to JSON string
        medicationInstruction.setTimeOfDay(request.getTimeToTake().toString());
        medicationInstruction.setSpecialInstructions(request.getNotes());

        // Set parent-specific fields
        medicationInstruction.setParentProvided(true);
        medicationInstruction.setStatus(Status.PENDING_APPROVAL);
        medicationInstruction.setSubmittedAt(LocalDate.now());
        medicationInstruction.setHealthProfile(healthProfile);
        medicationInstruction.setRequestedBy(parentEntity);

        // Handle prescription image if present
        if (request.getPrescriptionImageBase64() != null && request.getPrescriptionImageType() != null) {
            medicationInstruction.setPrescriptionImageBase64(request.getPrescriptionImageBase64());
            medicationInstruction.setPrescriptionImageType(request.getPrescriptionImageType());
        }

        MedicationInstruction savedMedicationInstruction = medicationInstructionRepository.save(medicationInstruction);
        return new MedicationInstructionDTO().toObject(savedMedicationInstruction);
    }

    @Override
    public List<MedicationInstructionDTO> getParentMedicationRequests(Authentication auth) {
        ParentDTO currentParent = parentService.getCurretParent(auth);
        List<MedicationInstruction> requests = medicationInstructionRepository.findByRequestedById(currentParent.getId());
        return requests.stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getMedicationRequestsByChild(Long studentId, Authentication auth) {
        // 1. Get current parent from authentication
        ParentDTO currentParent = parentService.getCurretParent(auth);
        // 2. Validate parent owns this student
        parentService.validateParentOwnsStudent(studentId, auth);
        // 3. Get student's health profile
        HealthProfile healthProfile = healthProfileRepository.findByStudentId(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe cho học sinh với ID: " + studentId));
        // 4. Find all medication instructions for this health profile
        List<MedicationInstruction> instructions = medicationInstructionRepository.findByHealthProfileId(healthProfile.getId());
        // 5. Filter by parentProvided = true (only parent requests)
        List<MedicationInstruction> parentRequests = instructions.stream()
                .filter(MedicationInstruction::getParentProvided)
                .toList();
        // 6. Convert entities to DTOs
        return parentRequests.stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());

    }

    @Override
    public MedicationInstructionDTO updateParentMedicationRequest(Long requestId, MedicationRequestDTO request, Authentication auth) {
        // 1. Get current parent from authentication
        ParentDTO currentParent = parentService.getCurretParent(auth);
        // 2. Find existing medication instruction by requestId
        Optional<MedicationInstruction> existingRequest = medicationInstructionRepository.findById(requestId);

        // 3. Validate parent owns this request (requestedBy = current parent)
        if (existingRequest.isEmpty() || !existingRequest.get().getRequestedBy().getId().equals(currentParent.getId())) {
            throw new EntityNotFoundException("Bạn không phải là người tạo yêu cầu này.");
        }
        // 4. Check request status is "PENDING_APPROVAL"
        if (!Status.PENDING_APPROVAL.equals(existingRequest.get().getStatus())) {
            throw new IllegalStateException("Yêu cầu này không thể cập nhật vì trạng thái không phải là PENDING_APPROVAL.");
        }

        // 6. Validate parent owns the student (if studentId changed)
        if (request.getStudentId() != null) {
            parentService.validateParentOwnsStudent(request.getStudentId(), auth);
        }
        // 7. Update medication details from request
        MedicationInstruction medicationInstruction = existingRequest.get();
        medicationInstruction.setMedicationName(request.getMedicineName());
        medicationInstruction.setDosageInstructions(request.getDosage());
        medicationInstruction.setStartDate(request.getStartDate());
        medicationInstruction.setEndDate(request.getEndDate());
        medicationInstruction.setFrequencyPerDay(request.getFrequency());
        
        // Convert timeToTake list to string
        medicationInstruction.setTimeOfDay(request.getTimeToTake().toString());
        medicationInstruction.setSpecialInstructions(request.getNotes());

        // Handle prescription image if present
        if (request.getPrescriptionImageBase64() != null && request.getPrescriptionImageType() != null) {
            medicationInstruction.setPrescriptionImageBase64(request.getPrescriptionImageBase64());
            medicationInstruction.setPrescriptionImageType(request.getPrescriptionImageType());
        }

        // 8. Save updated entity
        MedicationInstruction updatedMedicationInstruction = medicationInstructionRepository.save(medicationInstruction);
        // 9. Return updated DTO
        return new MedicationInstructionDTO().toObject(updatedMedicationInstruction);
    }

    @Override
    public List<MedicationInstructionDTO> getPendingMedicationRequests() {
        // 1. Find all medication instructions where:

        List<MedicationInstruction> pendingRequests = medicationInstructionRepository.findByStatus(Status.PENDING_APPROVAL)
                .stream()
                .filter(m -> m.getParentProvided() != null && m.getParentProvided())
                .collect(Collectors.toList());
        //    - approvalStatus = "PENDING_APPROVAL"
        //    - parentProvided = true
        // 2. Convert entities to DTOs
        return pendingRequests.stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());

    }

    @Override
    public MedicationInstructionDTO processApprovalRequest(Long requestId, NurseMedicationApprovalRequestDTO approvalRequest, Authentication authentication) {
        //1.find the medication request
        MedicationInstruction request = medicationInstructionRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu hướng dẫn thuốc với ID: " + requestId));
        //2.validate the request is pending approval
        if (!Status.PENDING_APPROVAL.equals(request.getStatus())) {
            throw new IllegalStateException("Yêu cầu này không thể xử lý vì trạng thái không phải là PENDING_APPROVAL.");
        }
        //3.validate the nurse is authenticated
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Nurse must be authenticated to process requests.");
        }
        //4.update the request status based on approvalRequest
        if ("APPROVED".equals(approvalRequest.getDecision())) {
            request.setStatus(Status.APPROVED);
        } else if ("REJECTED".equals(approvalRequest.getDecision())) {
            request.setStatus(Status.REJECTED);
            request.setRejectionReason(approvalRequest.getReason());
        }

        request.setResponseDate(LocalDateTime.now());
        Nurse nurse = nurseRepository.findByAccountId(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy y tá với ID: " + authentication.getName()));
        request.setApprovedBy(nurse);
        MedicationInstruction savedRequest = medicationInstructionRepository.save(request);
        return new MedicationInstructionDTO().toObject(savedRequest);


    }

    @Override
    public void cancelMedicationRequest(Long requestId, Authentication auth) {
        // 1. Get current parent from authentication
        ParentDTO currentParent = parentService.getCurretParent(auth);
        // 2. Find existing medication instruction by requestId
        Optional<MedicationInstruction> existingRequest = medicationInstructionRepository.findById(requestId);

        // 3. Validate parent owns this request (requestedBy = current parent)
        if (existingRequest.isEmpty() || !existingRequest.get().getRequestedBy().getId().equals(currentParent.getId())) {
            throw new EntityNotFoundException("Bạn không phải là người tạo yêu cầu này.");
        }
        // 4. Check request status is "PENDING_APPROVAL"
        if (!Status.PENDING_APPROVAL.equals(existingRequest.get().getStatus())) {
            throw new IllegalStateException("Yêu cầu này không thể cập nhật vì trạng thái không phải là PENDING_APPROVAL.");
        }

        // 7. Update medication details from request
      medicationInstructionRepository.deleteById(requestId);

    }


}



