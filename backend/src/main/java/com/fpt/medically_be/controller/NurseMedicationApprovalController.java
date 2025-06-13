package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.NurseMedicationApprovalRequestDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.service.MedicationInstructionService;
import com.fpt.medically_be.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(NurseMedicationApprovalController.class);
    
    private final MedicationInstructionService medicationInstructionService;
    private final NotificationService notificationService;

    @Autowired
    public NurseMedicationApprovalController(MedicationInstructionService medicationInstructionService,
                                             NotificationService notificationService)  {
        this.medicationInstructionService = medicationInstructionService;
        this.notificationService = notificationService;
    }

  // Get all pending medication requests for review
    @GetMapping("/pending")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getPendingMedicationRequests() {
        List<MedicationInstructionDTO> pendingRequests = medicationInstructionService.getPendingMedicationRequests();
        return ResponseEntity.ok(pendingRequests);
    }

   //view medication request details for review
    @GetMapping("/{requestId}")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<MedicationInstructionDTO> getMedicationRequestForReview(@PathVariable Long requestId) {
        MedicationInstructionDTO request = medicationInstructionService.getMedicationInstructionById(requestId);
        return ResponseEntity.ok(request);
    }

    //Approval or rejection of medication requests
    @PutMapping("/{requestId}/process")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<MedicationInstructionDTO> processApprovalRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody NurseMedicationApprovalRequestDTO approvalRequest,
            Authentication authentication) {
        
        try {
            MedicationInstructionDTO result = medicationInstructionService.processApprovalRequest(
                requestId, approvalRequest, authentication);

            // Send notification to the specific parent who made the request
            notificationService.sendNotificationToParent(result);
            
            return ResponseEntity.ok(result);
            
        } catch (EntityNotFoundException e) {
            logger.error("Medication request not found with ID: {}", requestId, e);
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            logger.error("Invalid state for processing request with ID: {}", requestId, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error processing approval request with ID: {}", requestId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 