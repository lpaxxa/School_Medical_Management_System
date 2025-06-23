package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.request.MedicationAdministrationRequestDTO;
import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.mapper.MedicationAdministrationMapper;
import com.fpt.medically_be.repos.MedicationAdministrationRepository;
import com.fpt.medically_be.repos.MedicationInstructionRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.service.MedicationAdministrationService;
import com.fpt.medically_be.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicationAdministrationServiceImpl implements MedicationAdministrationService {

    @Autowired
    private MedicationAdministrationRepository administrationRepository;
    
    @Autowired
    private MedicationInstructionRepository medicationInstructionRepository;
    
    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    @Qualifier("medicationAdministrationMapperImpl")
    private MedicationAdministrationMapper administrationMapper;
    
    @Autowired
    private NotificationService notificationService;

    @Override
    public MedicationAdministrationResponseDTO recordAdministration(MedicationAdministrationRequestDTO request, Authentication auth) {
        // 1. Find the medication instruction
        MedicationInstruction medicationInstruction = medicationInstructionRepository.findById(request.getMedicationInstructionId())
                .orElseThrow(() -> new EntityNotFoundException("Medication instruction not found with ID: " + request.getMedicationInstructionId()));
        
        // 2. Get current nurse from authentication
        String accountId = auth.getName();
        Nurse nurse = nurseRepository.findByAccountId(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Nurse not found with account ID: " + accountId));
        
        // 3. Create administration record using mapper
        MedicationAdministration administration = administrationMapper.toEntity(request);
        administration.setMedicationInstruction(medicationInstruction);
        administration.setAdministeredBy(nurse);
        
        // 4. Save and return
        MedicationAdministration saved = administrationRepository.save(administration);
        MedicationAdministrationResponseDTO responseDTO = administrationMapper.toResponseDTO(saved);
        
        // 5. Send notification to parent (only the parent who owns this child)
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
                .totalItems(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .currentPage(page)
                .posts(administrationDTOs)
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
                .totalItems(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .currentPage(page)
                .posts(administrationDTOs)
                .build();
    }



    @Override
    public PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByDateRange(Date start, Date end, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<MedicationAdministration> administrations = administrationRepository.findByAdministeredAtBetweenOrderByAdministeredAtDesc(start, end, pageable);
        
        List<MedicationAdministrationResponseDTO> administrationDTOs = administrations.getContent().stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());

        return PageResponse.<MedicationAdministrationResponseDTO>builder()
                .totalItems(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .currentPage(page)
                .posts(administrationDTOs)
                .build();
    }

    @Override
    public PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByStatus(AdministrationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<MedicationAdministration> administrations = administrationRepository.findByAdministrationStatusOrderByAdministeredAtDesc(status, pageable);
        
        List<MedicationAdministrationResponseDTO> administrationDTOs = administrations.getContent().stream()
                .map(administrationMapper::toResponseDTO)
                .collect(Collectors.toList());

        return PageResponse.<MedicationAdministrationResponseDTO>builder()
                .totalItems(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .currentPage(page)
                .posts(administrationDTOs)
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
                .totalItems(administrations.getTotalElements())
                .totalPages(administrations.getTotalPages())
                .currentPage(page)
                .posts(administrationDTOs)
                .build();
    }

    @Override
    public MedicationAdministrationResponseDTO updateAdministration(Long id, MedicationAdministrationRequestDTO request, Authentication auth) {
        MedicationAdministration administration = administrationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Administration record not found with ID: " + id));
        
        // Update fields
        administration.setAdministeredAt(request.getAdministeredAt());
        administration.setAdministrationStatus(request.getAdministrationStatus());
        administration.setNotes(request.getNotes());
        
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
        }
        
        return responseDTO;
    }


} 