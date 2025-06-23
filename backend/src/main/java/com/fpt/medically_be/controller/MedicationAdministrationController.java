package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.request.MedicationAdministrationRequestDTO;
import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.entity.AdministrationStatus;
import com.fpt.medically_be.service.MedicationAdministrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for Medication Administration operations
 * Handles nurses recording when they give medications to students
 */
@RestController
@RequestMapping("/api/v1/medication-administrations")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
public class MedicationAdministrationController {

    @Autowired
    private MedicationAdministrationService administrationService;

    /**
     * Record a new medication administration
     * POST /api/v1/medication-administrations
     */
    @PostMapping
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<MedicationAdministrationResponseDTO> recordAdministration(
            @Valid @RequestBody MedicationAdministrationRequestDTO request,
            Authentication authentication) {
        MedicationAdministrationResponseDTO result = administrationService.recordAdministration(request, authentication);
        return ResponseEntity.ok(result);
    }

    /**
     * Get administration record by ID
     * GET /api/v1/medication-administrations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<MedicationAdministrationResponseDTO> getAdministrationById(@PathVariable Long id) {
        MedicationAdministrationResponseDTO result = administrationService.getAdministrationById(id);
        return ResponseEntity.ok(result);
    }

    /**
     * Get all administration records for a specific medication instruction with pagination
     * GET /api/v1/medication-administrations/medication-instruction/{medicationInstructionId}?page=1&size=10
     */
    @GetMapping("/medication-instruction/{medicationInstructionId}")
    public ResponseEntity<Map<String, Object>> getAdministrationsByMedicationInstruction(
            @PathVariable Long medicationInstructionId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<MedicationAdministrationResponseDTO> pageResponse = administrationService.getAdministrationsByMedicationInstruction(medicationInstructionId, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", pageResponse);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all administration records for a specific student with pagination
     * GET /api/v1/medication-administrations/student/{studentId}?page=1&size=10
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getAdministrationsByStudent(
            @PathVariable String studentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<MedicationAdministrationResponseDTO> pageResponse = administrationService.getAdministrationsByStudent(studentId, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", pageResponse);
        
        return ResponseEntity.ok(response);
    }



    /**
     * Get administration records by date range with pagination
     * GET /api/v1/medication-administrations/date-range?start=2024-01-01T09:00:00&end=2024-01-31T17:00:00&page=1&size=10
     */
    @GetMapping("/date-range")
    public ResponseEntity<Map<String, Object>> getAdministrationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date end,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<MedicationAdministrationResponseDTO> pageResponse = administrationService.getAdministrationsByDateRange(start, end, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", pageResponse);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get administration records by status with pagination
     * GET /api/v1/medication-administrations/status/{status}?page=1&size=10
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getAdministrationsByStatus(
            @PathVariable AdministrationStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<MedicationAdministrationResponseDTO> pageResponse = administrationService.getAdministrationsByStatus(status, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", pageResponse);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get recent administration records (for dashboard) with pagination
     * GET /api/v1/medication-administrations/recent?page=1&size=10
     */
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentAdministrations(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<MedicationAdministrationResponseDTO> pageResponse = administrationService.getRecentAdministrations(page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", pageResponse);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Update an administration record
     * PUT /api/v1/medication-administrations/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<MedicationAdministrationResponseDTO> updateAdministration(
            @PathVariable Long id,
            @Valid @RequestBody MedicationAdministrationRequestDTO request,
            Authentication authentication) {
        MedicationAdministrationResponseDTO result = administrationService.updateAdministration(id, request, authentication);
        return ResponseEntity.ok(result);
    }
} 