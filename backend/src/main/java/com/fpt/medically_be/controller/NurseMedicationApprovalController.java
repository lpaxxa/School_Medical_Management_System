package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.NurseMedicationApprovalRequestDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.service.MedicationInstructionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Nurse Medication Approval operations
 * Handles nurse review and approval/rejection of parent medication requests
 */
@RestController
@RequestMapping("/api/v1/nurse-medication-approvals")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
public class NurseMedicationApprovalController {

    private final MedicationInstructionService medicationInstructionService;
    private final SimpMessagingTemplate messagingTemplate;


    public NurseMedicationApprovalController(MedicationInstructionService medicationInstructionService,
                                             SimpMessagingTemplate messagingTemplate)  {
        this.medicationInstructionService = medicationInstructionService;
        this.messagingTemplate = messagingTemplate;
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

            // Notify clients about the approval/rejection
            messagingTemplate.convertAndSendToUser("parentID", "/queue/medication-approval", result);
            return ResponseEntity.ok(result);
            
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }







} 