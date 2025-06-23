package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.request.MedicationAdministrationRequestDTO;
import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.entity.AdministrationStatus;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;

public interface MedicationAdministrationService {
    
    // Record new administration
    MedicationAdministrationResponseDTO recordAdministration(MedicationAdministrationRequestDTO request, Authentication auth);
    
    // Get administration by ID
    MedicationAdministrationResponseDTO getAdministrationById(Long id);
    
    // Get all administrations for a medication instruction with pagination
    PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByMedicationInstruction(Long medicationInstructionId, int page, int size);
    
    // Get administrations by student with pagination
    PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByStudent(String studentId, int page, int size);
    
    // Get administrations by date range with pagination
    PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByDateRange(LocalDateTime start, LocalDateTime end, int page, int size);
    
    // Get administrations by status with pagination
    PageResponse<MedicationAdministrationResponseDTO> getAdministrationsByStatus(AdministrationStatus status, int page, int size);
    
    // Get recent administrations with pagination
    PageResponse<MedicationAdministrationResponseDTO> getRecentAdministrations(int page, int size);
    
    // Update administration record
    MedicationAdministrationResponseDTO updateAdministration(Long id, MedicationAdministrationRequestDTO request, Authentication auth);
} 