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
import com.fpt.medically_be.service.CloudinaryService;
import com.fpt.medically_be.service.MedicationInstructionService;
import com.fpt.medically_be.service.ParentService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private final CloudinaryService cloudinaryService;

@Autowired
    public MedicationInstructionServiceImpl(MedicationInstructionRepository medicationInstructionRepository,
                                            HealthProfileRepository healthProfileRepository,
                                            StudentRepository studentRepository, ParentService parentService,
                                            ParentRepository parentRepository, NurseRepository nurseRepository, CloudinaryService cloudinaryService) {
        this.medicationInstructionRepository = medicationInstructionRepository;
        this.healthProfileRepository = healthProfileRepository;
        this.studentRepository = studentRepository;
        this.parentService = parentService;
        this.parentRepository = parentRepository;
        this.nurseRepository = nurseRepository;
    this.cloudinaryService = cloudinaryService;
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

    //sending-medication flow

    @Override
    public MedicationInstructionDTO createParentMedicationRequest(MedicationRequestDTO request, Authentication auth) {
       //null-check for studentId
        if (request.getStudentId() == null) {
            throw new IllegalArgumentException("Không thể tạo yêu cầu thuốc: Student ID không được để trống.");
        }
        ParentDTO currentParent = parentService.getCurrentParent(auth);
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
        if (request.getPrescriptionImageBase64() != null) {
            medicationInstruction.setPrescriptionImageBase64(request.getPrescriptionImageBase64());

        }

        MedicationInstruction savedMedicationInstruction = medicationInstructionRepository.save(medicationInstruction);
        return new MedicationInstructionDTO().toObject(savedMedicationInstruction);
    }

    @Override
    public List<MedicationInstructionDTO> getParentMedicationRequests(Authentication auth) {
        ParentDTO currentParent = parentService.getCurrentParent(auth);

        List<MedicationInstruction> requests= medicationInstructionRepository.findByRequestedById(currentParent.getId());
        return requests.stream().map(r -> new MedicationInstructionDTO().toObject(r)).collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getMedicationRequestsByChild(Long studentId, Authentication auth) {
        
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
        ParentDTO currentParent = parentService.getCurrentParent(auth);
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
        if (request.getPrescriptionImageBase64() != null ) {
            medicationInstruction.setPrescriptionImageBase64(request.getPrescriptionImageBase64());

        }

        // 8. Save updated entity
        MedicationInstruction updatedMedicationInstruction = medicationInstructionRepository.save(medicationInstruction);
        // 9. Return updated DTO
        return new MedicationInstructionDTO().toObject(updatedMedicationInstruction);
    }

    @Override
    public List<MedicationInstructionDTO> getPendingMedicationRequests() {
        List<MedicationInstruction> pendingRequests = medicationInstructionRepository.findByStatusAndParentProvidedTrue(Status.PENDING_APPROVAL);
        return pendingRequests.stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getApprovedMedicationRequests() {
        List<MedicationInstruction> approvedRequests = medicationInstructionRepository.findByStatusAndParentProvidedTrue(Status.APPROVED);
        return approvedRequests.stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getRejectedMedicationRequests() {
       List<MedicationInstruction> rejectedRequests = medicationInstructionRepository.findByStatusAndParentProvidedTrue(Status.REJECTED);
        return rejectedRequests.stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getAllMedicationRequests() {
        // Only return parent-provided medication requests to be consistent with other methods
        // and avoid DTO transformation errors with system-generated instructions
        List<MedicationInstruction> allRequests = medicationInstructionRepository.findByParentProvided(true);
        return allRequests.stream()
                .map(entity -> new MedicationInstructionDTO().toObject(entity))
                .collect(Collectors.toList());

    }

    @Override
    public MedicationInstructionDTO processApprovalRequest(Long requestId, @Valid NurseMedicationApprovalRequestDTO approvalRequest, Authentication authentication) {
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
        ParentDTO currentParent = parentService.getCurrentParent(auth);
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

    @Override
    public int updateExpiredMedicationInstructions() {
        LocalDate today = LocalDate.now();

        // Find all APPROVED instructions where the end date has passed
        List<MedicationInstruction> expiredInstructions = medicationInstructionRepository.findByStatusAndEndDateBefore(Status.APPROVED, today);

        if (expiredInstructions.isEmpty()) {
            return 0;
        }

        // Update status to EXPIRED for all found instructions
        for (MedicationInstruction instruction : expiredInstructions) {
            instruction.setStatus(Status.EXPIRED);
        }

        medicationInstructionRepository.saveAll(expiredInstructions);
        return expiredInstructions.size();
    }

    @Override
    public MedicationInstructionDTO uploadConfirmationImage(Long instructionId, MultipartFile imageFile, Authentication auth) throws IOException {
        // 1. Tìm record MedicationAdministration theo ID
        MedicationInstruction instruction= medicationInstructionRepository.findById(instructionId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bản ghi cho uống thuốc với ID: " + instructionId));

        // 2. Xác thực y tá có quyền cập nhật bản ghi này
        String accountId = auth.getName();
       Parent parent = parentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phụ huynh với tài khoản ID: " + accountId));

        // 3. Kiểm tra xem y tá này có phải là người đã thực hiện cho uống thuốc không
        if (!instruction.getRequestedBy().getId().equals(parent.getId())) {
            throw new IllegalStateException("Bạn không có quyền cập nhật ảnh xác nhận cho bản ghi này");
        }

        // 4. Upload ảnh lên Cloudinary
        String imageUrl = cloudinaryService.uploadMedicationConfirmImage(imageFile, instructionId);

        // Kiểm tra imageUrl có null hoặc rỗng không
        if (imageUrl == null || imageUrl.isEmpty()) {
            throw new IOException("Không thể tải lên ảnh xác nhận, URL trả về là null hoặc rỗng");
        }

        // 5. Cập nhật URL ảnh vào record
        instruction.setPrescriptionImageBase64(imageUrl);

        // 6. Lưu thay đổi và đảm bảo có kết quả trả về
        MedicationInstruction updatedInstruction = medicationInstructionRepository.saveAndFlush(instruction);

        // Kiểm tra xem URL đã được lưu chưa
        if (updatedInstruction.getPrescriptionImageBase64() == null ||
                updatedInstruction.getPrescriptionImageBase64().isEmpty()) {
            throw new IOException("URL ảnh xác nhận không được lưu vào database");
        }

        // 7. Chuyển đổi thành DTO với URL ảnh
       MedicationInstructionDTO responseDTO = new MedicationInstructionDTO().toObject(updatedInstruction);

        // Đảm bảo URL ảnh được chuyển sang DTO đúng cách
        if (responseDTO.getPrescriptionImageUrl()== null || responseDTO.getPrescriptionImageUrl().isEmpty()) {
            responseDTO.setPrescriptionImageUrl(imageUrl); // Gán trực tiếp nếu mapper không hoạt động đúng
        }

        return responseDTO;
    }


}
