package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.NurseMedicationApprovalRequestDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.service.MedicationInstructionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Nurse Medication Approval operations
 * Handles nurse review and approval/rejection of parent medication requests
 */
@RestController
@RequestMapping("/api/nurse-medication-approvals")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
public class NurseMedicationApprovalController {

    private final MedicationInstructionService medicationInstructionService;

    @Autowired
    public NurseMedicationApprovalController(MedicationInstructionService medicationInstructionService) {
        this.medicationInstructionService = medicationInstructionService;
    }

    /**
     * Get all pending medication requests awaiting approval
     * GET /api/nurse-medication-approvals/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<MedicationInstructionDTO>> getPendingMedicationRequests() {
        List<MedicationInstructionDTO> pendingRequests = medicationInstructionService.getPendingMedicationRequests();
        return ResponseEntity.ok(pendingRequests);
    }

    /**
     * Get a specific medication request for review
     * GET /api/nurse-medication-approvals/{requestId}
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<MedicationInstructionDTO> getMedicationRequestForReview(@PathVariable Long requestId) {
        MedicationInstructionDTO request = medicationInstructionService.getMedicationInstructionById(requestId);
        return ResponseEntity.ok(request);
    }

    /**
     * Approve or reject a medication request (without notification)
     * PUT /api/nurse-medication-approvals/{requestId}/process
     */
    @PutMapping("/{requestId}/process")
    public ResponseEntity<MedicationInstructionDTO> processApprovalRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody NurseMedicationApprovalRequestDTO approvalRequest,
            Authentication authentication) {
        
        try {
            MedicationInstructionDTO result = medicationInstructionService.processApprovalRequest(
                requestId, approvalRequest, authentication);
            return ResponseEntity.ok(result);
            
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Approve or reject a medication request (notification functionality removed)
     * PUT /api/nurse-medication-approvals/{requestId}/process-with-notification
     * @deprecated Notification functionality has been removed, use /process endpoint instead
     */
    @PutMapping("/{requestId}/process-with-notification")
    @Deprecated
    public ResponseEntity<MedicationInstructionDTO> processApprovalRequestWithNotification(
            @PathVariable Long requestId,
            @Valid @RequestBody NurseMedicationApprovalRequestDTO approvalRequest,
            Authentication authentication) {
        
        // Notification functionality has been removed, just process the approval
        return processApprovalRequest(requestId, approvalRequest, authentication);
    }





} 