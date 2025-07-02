package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.request.MedicationAdministrationRequestDTO;
import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.mapper.MedicationAdministrationMapper;
import com.fpt.medically_be.repos.MedicationAdministrationRepository;
import com.fpt.medically_be.repos.MedicationInstructionRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.service.CloudinaryService;
import com.fpt.medically_be.service.MedicationAdministrationService;
import com.fpt.medically_be.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalDate;

import java.util.List;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@Service
@Transactional
public class MedicationAdministrationServiceImpl implements MedicationAdministrationService {

    private static final Logger logger = Logger.getLogger(MedicationAdministrationServiceImpl.class.getName());


    private final MedicationAdministrationRepository administrationRepository;
    

    private final MedicationInstructionRepository medicationInstructionRepository;
    

    private final NurseRepository nurseRepository;



    private final MedicationAdministrationMapper administrationMapper;


    private final NotificationService notificationService;


    private final CloudinaryService cloudinaryService;

    public MedicationAdministrationServiceImpl(MedicationAdministrationRepository administrationRepository, MedicationInstructionRepository medicationInstructionRepository, NurseRepository nurseRepository, MedicationAdministrationMapper administrationMapper, NotificationService notificationService, CloudinaryService cloudinaryService) {
        this.administrationRepository = administrationRepository;
        this.medicationInstructionRepository = medicationInstructionRepository;
        this.nurseRepository = nurseRepository;
        this.administrationMapper = administrationMapper;
        this.notificationService = notificationService;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public MedicationAdministrationResponseDTO recordAdministration(MedicationAdministrationRequestDTO request, Authentication auth) {
        // 1. Find the medication instruction
        MedicationInstruction medicationInstruction = medicationInstructionRepository.findById(request.getMedicationInstructionId())
                .orElseThrow(() -> new EntityNotFoundException("Medication instruction not found with ID: " + request.getMedicationInstructionId()));
        
        // 2. CRITICAL: Validate medication instruction is approved
        if (medicationInstruction.getStatus() != Status.APPROVED && medicationInstruction.getStatus() != Status.PARTIALLY_TAKEN) {
            throw new IllegalStateException("Cannot administer medication: instruction status is " + medicationInstruction.getStatus() + ". Only APPROVED or PARTIALLY instructions can be administered.");
        }


        // 3. Validate administration date is within medication period
        LocalDate adminDate = request.getAdministeredAt().toLocalDate();
        if (medicationInstruction.getStartDate() != null && adminDate.isBefore(medicationInstruction.getStartDate())) {
            throw new IllegalArgumentException("Administration date cannot be before medication start date");
        }
        if (medicationInstruction.getEndDate() != null && adminDate.isAfter(medicationInstruction.getEndDate())) {
            throw new IllegalArgumentException("Administration date cannot be after medication end date");
        }

        // 4. Validate administration time is not in the future
        if (request.getAdministeredAt().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Administration time cannot be in the future");
        }

        // 5. Get current nurse from authentication
        String accountId = auth.getName();
        Nurse nurse = nurseRepository.findByAccountId(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Nurse not found with account ID: " + accountId));

        // 6. Create administration record using mapper
        MedicationAdministration administration = administrationMapper.toEntity(request);
        administration.setMedicationInstruction(medicationInstruction);
        administration.setAdministeredBy(nurse);
        try {
            int requestedFrequency = request.getFrequencyPerDay();
            int maxFrequency = medicationInstruction.getFrequencyPerDay();

            // Validate frequency is within allowed range
            if (requestedFrequency < 0) {
                throw new IllegalArgumentException("Frequency cannot be negative");
            }

            if (requestedFrequency > maxFrequency) {
                throw new IllegalArgumentException("Requested frequency (" + requestedFrequency +
                        ") exceeds maximum allowed frequency (" + maxFrequency + ")");
            }
            //SET STATUS
            if (request.getFrequencyPerDay() < medicationInstruction.getFrequencyPerDay() && request.getFrequencyPerDay() > 0) {
                administration.setAdministrationStatus(Status.PARTIALLY_TAKEN);
                medicationInstruction.setStatus(Status.PARTIALLY_TAKEN);
            } else if (request.getFrequencyPerDay() == medicationInstruction.getFrequencyPerDay()) {
                administration.setAdministrationStatus(Status.FULLY_TAKEN);
                medicationInstruction.setStatus(Status.FULLY_TAKEN);
            } else if (medicationInstruction.getEndDate().isBefore(LocalDate.now())) {
                administration.setAdministrationStatus(Status.NOT_TAKEN);
                medicationInstruction.setStatus(Status.NOT_TAKEN);
            }
        }catch (NumberFormatException e) {
            logger.severe("Invalid frequency format: " + e.getMessage());
            throw new IllegalArgumentException("Frequency must be a valid number");
        } catch (Exception e) {
            logger.severe("Error processing frequency: " + e.getMessage());
            throw new IllegalStateException("Error setting administration status: " + e.getMessage());
        }

        // createdAt will be set automatically by @PrePersist

        // 7. Save and return
        MedicationAdministration saved = administrationRepository.save(administration);
        MedicationAdministrationResponseDTO responseDTO = administrationMapper.toResponseDTO(saved);

        // 8. Send notification to parent (only the parent who owns this child)
        try {
            // Get parent account ID from the medication instruction
            String parentAccountId = null;
            if (medicationInstruction.getRequestedBy() != null &&
                medicationInstruction.getRequestedBy().getAccount() != null) {
                parentAccountId = medicationInstruction.getRequestedBy().getAccount().getId();
            }

            if (parentAccountId != null) {
                notificationService.sendMedicationAdministrationNotificationToParent(responseDTO, parentAccountId);
            }
        } catch (Exception e) {
            // Log but don't fail the main operation if notification fails
            // The medication administration was successful, notification is secondary
            logger.warning("Failed to send notification to parent for administration ID " + saved.getId() + ": " + e.getMessage());
        }

        return responseDTO;
    }

    @Override
    public MedicationAdministrationResponseDTO getAdministrationById(Long id) {
        MedicationAdministration administration = administrationRepository.findByIdWithDetails(id);
        if (administration == null) {
            throw new EntityNotFoundException("Administration record not found with ID: " + id);
        }
        return administrationMapper.toResponseDTO(administration);
    }

    @Override
    public PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByMedicationInstruction(Long medicationInstructionId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<MedicationAdministration> administrations = administrationRepository.findByMedicationInstructionId(medicationInstructionId, pageable);
        
        List<MedicationAdministrationResponseDTO> administrationDTOs = administrations.getContent().stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());

        return PageResponse.<MedicationAdministrationResponseDTO>builder()
                .totalElements(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .page(page)
                .content(administrationDTOs)
                .build();
    }

    @Override
    public PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByStudent(String studentId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<MedicationAdministration> administrations = administrationRepository.findByStudentId(studentId, pageable);
        
        List<MedicationAdministrationResponseDTO> administrationDTOs = administrations.getContent().stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());

        return PageResponse.<MedicationAdministrationResponseDTO>builder()
                .totalElements(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .page(page)
                .content(administrationDTOs)
                .build();
    }



    @Override
    public PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByDateRange(LocalDateTime start, LocalDateTime end, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<MedicationAdministration> administrations = administrationRepository.findByAdministeredAtBetweenOrderByAdministeredAtDesc(start, end, pageable);
        
        List<MedicationAdministrationResponseDTO> administrationDTOs = administrations.getContent().stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());

        return PageResponse.<MedicationAdministrationResponseDTO>builder()
                .totalElements(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .page(page)
                .content(administrationDTOs)
                .build();
    }

    @Override
    public PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByStatus(Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<MedicationAdministration> administrations = administrationRepository.findByAdministrationStatusOrderByAdministeredAtDesc(status, pageable);
        
        List<MedicationAdministrationResponseDTO> administrationDTOs = administrations.getContent().stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());

        return PageResponse.<MedicationAdministrationResponseDTO>builder()
                .totalElements(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .page(page)
                .content(administrationDTOs)
                .build();
    }

    @Override
    public PageResponse<MedicationAdministrationResponseDTO> getRecentAdministrations(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<MedicationAdministration> administrations = administrationRepository.findRecentAdministrations(pageable);
        
        List<MedicationAdministrationResponseDTO> administrationDTOs = administrations.getContent().stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());

        return PageResponse.<MedicationAdministrationResponseDTO>builder()
                .totalElements(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .page(page)
                .content(administrationDTOs)
                .build();
    }

    @Override
    public MedicationAdministrationResponseDTO updateAdministration(Long id, MedicationAdministrationRequestDTO request, Authentication auth) {
        MedicationAdministration administration = administrationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Administration record not found with ID: " + id));
        
        // Validate the medication instruction is still in approved status
        if (administration.getMedicationInstruction().getStatus() != Status.APPROVED) {
            throw new IllegalStateException("Cannot update administration: medication instruction is no longer approved");
        }
        
        // Validate administration time is not in the future
        if (request.getAdministeredAt().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Administration time cannot be in the future");
        }
        
        // Validate administration date is within medication period
        LocalDate adminDate = request.getAdministeredAt().toLocalDate();
        MedicationInstruction medicationInstruction = administration.getMedicationInstruction();
        if (medicationInstruction.getStartDate() != null && adminDate.isBefore(medicationInstruction.getStartDate())) {
            throw new IllegalArgumentException("Administration date cannot be before medication start date");
        }
        if (medicationInstruction.getEndDate() != null && adminDate.isAfter(medicationInstruction.getEndDate())) {
            throw new IllegalArgumentException("Administration date cannot be after medication end date");
        }
        
        // Update fields
        administration.setAdministeredAt(request.getAdministeredAt());
       // administration.setAdministrationStatus(request.getAdministrationStatus());
        administration.setNotes(request.getNotes());
        administration.setConfirmationImageUrl(request.getImgUrl());
        
        MedicationAdministration updated = administrationRepository.save(administration);
        MedicationAdministrationResponseDTO responseDTO = administrationMapper.toResponseDTO(updated);
        
        // Send notification to parent about the update (only the parent who owns this child)
        try {
            // Get parent account ID from the medication instruction
            String parentAccountId = null;
            if (updated.getMedicationInstruction().getRequestedBy() != null && 
                updated.getMedicationInstruction().getRequestedBy().getAccount() != null) {
                parentAccountId = updated.getMedicationInstruction().getRequestedBy().getAccount().getId();
            }
            
            if (parentAccountId != null) {
                notificationService.sendMedicationAdministrationNotificationToParent(responseDTO, parentAccountId);
            }
        } catch (Exception e) {
            // Log but don't fail the main operation if notification fails
            logger.warning("Failed to send notification to parent for updated administration ID " + updated.getId() + ": " + e.getMessage());
        }
        
        return responseDTO;
    }

    @Override
    public MedicationAdministrationResponseDTO uploadConfirmationImage(Long administrationId, MultipartFile imageFile, Authentication auth) throws IOException {
        // 1. Tìm record MedicationAdministration theo ID
        MedicationAdministration administration = administrationRepository.findById(administrationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bản ghi cho uống thuốc với ID: " + administrationId));

        // 2. Xác thực y tá có quyền cập nhật bản ghi này
        String accountId = auth.getName();
        Nurse nurse = nurseRepository.findByAccountId(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy y tá với tài khoản ID: " + accountId));

        // 3. Kiểm tra xem y tá này có phải là người đã thực hiện cho uống thuốc không
        if (!administration.getAdministeredBy().getId().equals(nurse.getId())) {
            throw new IllegalStateException("Bạn không có quyền cập nhật ảnh xác nhận cho bản ghi này");
        }

        // 4. Upload ảnh lên Cloudinary
        String imageUrl = cloudinaryService.uploadMedicationConfirmImage(imageFile, administrationId);

        // Kiểm tra imageUrl có null hoặc rỗng không
        if (imageUrl == null || imageUrl.isEmpty()) {
            throw new IOException("Không thể tải lên ảnh xác nhận, URL trả về là null hoặc rỗng");
        }

        // 5. Cập nhật URL ảnh vào record
        administration.setConfirmationImageUrl(imageUrl);

        // 6. Lưu thay đổi và đảm bảo có kết quả trả về
        MedicationAdministration updatedAdministration = administrationRepository.saveAndFlush(administration);

        // Kiểm tra xem URL đã được lưu chưa
        if (updatedAdministration.getConfirmationImageUrl() == null ||
            updatedAdministration.getConfirmationImageUrl().isEmpty()) {
            throw new IOException("URL ảnh xác nhận không được lưu vào database");
        }

        // 7. Chuyển đổi thành DTO với URL ảnh
        MedicationAdministrationResponseDTO responseDTO = administrationMapper.toResponseDTO(updatedAdministration);

        // Đảm bảo URL ảnh được chuyển sang DTO đúng cách
        if (responseDTO.getConfirmationImageUrl() == null || responseDTO.getConfirmationImageUrl().isEmpty()) {
            responseDTO.setConfirmationImageUrl(imageUrl); // Gán trực tiếp nếu mapper không hoạt động đúng
        }

        return responseDTO;
    }

    // Non-paginated methods implementation
    
    @Override
    public List<MedicationAdministrationResponseDTO> getAllAdministrationsByMedicationInstruction(Long medicationInstructionId) {
        List<MedicationAdministration> administrations = administrationRepository.findByMedicationInstructionIdOrderByAdministeredAtDesc(medicationInstructionId);
        return administrations.stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationAdministrationResponseDTO> getAllAdministrationsByStudent(String studentId) {
        List<MedicationAdministration> administrations = administrationRepository.findAllByStudentId(studentId);
        return administrations.stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationAdministrationResponseDTO> getAllAdministrationsByDateRange(LocalDateTime start, LocalDateTime end) {
        List<MedicationAdministration> administrations = administrationRepository.findByAdministeredAtBetweenOrderByAdministeredAtDesc(start, end);
        return administrations.stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationAdministrationResponseDTO> getAllAdministrationsByStatus(Status status) {
        List<MedicationAdministration> administrations = administrationRepository.findByAdministrationStatusOrderByAdministeredAtDesc(status);
        return administrations.stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationAdministrationResponseDTO> getAllRecentAdministrations() {
        List<MedicationAdministration> administrations = administrationRepository.findAllRecentAdministrations();
        return administrations.stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationAdministrationResponseDTO> getAllAdministrations() {
        List<MedicationAdministration> administrations = administrationRepository.findAllOrderByAdministeredAtDesc();
        return administrations.stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

}
