package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.MedicationRequestDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.service.MedicationInstructionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Parent Medication Request operations
 * Handles parent-initiated medication requests for their children
 */
@RestController
@RequestMapping("/api/parent-medication-requests")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('PARENT')")
public class ParentMedicationRequestController {

    private final MedicationInstructionService medicationInstructionService;

    @Autowired
    public ParentMedicationRequestController(MedicationInstructionService medicationInstructionService) {
        this.medicationInstructionService = medicationInstructionService;
    }

    /**
     * Submit a new medication request for a child
     * POST /api/parent-medication-requests
     */
    @PostMapping
    public ResponseEntity<MedicationInstructionDTO> submitMedicationRequest(
            @Valid @RequestBody MedicationRequestDTO request, 
            Authentication auth) {
        
        MedicationInstructionDTO result = medicationInstructionService.createParentMedicationRequest(request, auth);
        return ResponseEntity.ok(result);
    }

    /**
     * Get all medication requests submitted by the current parent
     * GET /api/parent-medication-requests
     */
    @GetMapping
    public ResponseEntity<List<MedicationInstructionDTO>> getMyMedicationRequests(Authentication auth) {
        List<MedicationInstructionDTO> requests = medicationInstructionService.getParentMedicationRequests(auth);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get medication requests for a specific child
     * GET /api/parent-medication-requests/child/{studentId}
     */
    @GetMapping("/child/{studentId}")
    public ResponseEntity<List<MedicationInstructionDTO>> getMedicationRequestsByChild(
            @PathVariable Long studentId, 
            Authentication auth) {
        
        List<MedicationInstructionDTO> requests = medicationInstructionService.getMedicationRequestsByChild(studentId, auth);
        return ResponseEntity.ok(requests);
    }

    /**
     * Update an existing medication request (only if status is PENDING_APPROVAL)
     * PUT /api/parent-medication-requests/{requestId}
     */
    @PutMapping("/{requestId}")
    public ResponseEntity<MedicationInstructionDTO> updateMedicationRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody MedicationRequestDTO request, 
            Authentication auth) {
        
        MedicationInstructionDTO result = medicationInstructionService.updateParentMedicationRequest(requestId, request, auth);
        return ResponseEntity.ok(result);
    }

    /**
     * Get a specific medication request by ID
     * GET /api/parent-medication-requests/{requestId}
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<MedicationInstructionDTO> getMedicationRequestById(@PathVariable Long requestId) {
        MedicationInstructionDTO request = medicationInstructionService.getMedicationInstructionById(requestId);
        return ResponseEntity.ok(request);
    }

    /**
     * Cancel a medication request (only if status is PENDING_APPROVAL)
     * DELETE /api/parent-medication-requests/{requestId}
     */
    @DeleteMapping("/{requestId}")
    public ResponseEntity<Void> cancelMedicationRequest(
            @PathVariable Long requestId, 
            Authentication auth) {
        
        // TODO: Implement cancel functionality in service
        // For now, this would require adding a new service method
        // medicationInstructionService.cancelParentMedicationRequest(requestId, auth);
        
        return ResponseEntity.noContent().build();
    }
} 