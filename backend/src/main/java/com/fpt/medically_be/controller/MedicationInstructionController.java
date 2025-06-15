package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.entity.Status;
import com.fpt.medically_be.service.MedicationInstructionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller for basic Medication Instruction CRUD operations
 * Handles admin/nurse management of medication instructions
 * For parent medication requests: @see ParentMedicationRequestController
 * For nurse approvals: @see NurseMedicationApprovalController
 */
@RestController
@RequestMapping("/api/v1/medication-instructions")
@CrossOrigin(origins = "*")
public class MedicationInstructionController {

    private final MedicationInstructionService medicationInstructionService;

    @Autowired
    public MedicationInstructionController(MedicationInstructionService medicationInstructionService) {
        this.medicationInstructionService = medicationInstructionService;
    }

    /**
     * Get all medication instructions (Admin/Nurse view)
     * GET /api/v1/medication-instructions
     */
    @GetMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getAllMedicationInstructions() {
        return ResponseEntity.ok(medicationInstructionService.getAllMedicationInstructions());
    }

    /**
     * Get medication instruction by ID
     * GET /api/v1/medication-instructions/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<MedicationInstructionDTO> getMedicationInstructionById(@PathVariable Long id) {
        return ResponseEntity.ok(medicationInstructionService.getMedicationInstructionById(id));
    }

    /**
     * Get medication instructions by health profile ID
     * GET /api/v1/medication-instructions/health-profile/{healthProfileId}
     */
    @GetMapping("/health-profile/{healthProfileId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<MedicationInstructionDTO>> getMedicationInstructionsByHealthProfileId(@PathVariable Long healthProfileId) {
        return ResponseEntity.ok(medicationInstructionService.getMedicationInstructionsByHealthProfileId(healthProfileId));
    }

    /**
     * Get medication instructions by status
     * GET /api/v1/medication-instructions/status/{status}
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getMedicationInstructionsByStatus(@PathVariable Status status) {
        return ResponseEntity.ok(medicationInstructionService.getMedicationInstructionsByStatus(status));
    }

    /**
     * Get expired medication instructions
     * GET /api/v1/medication-instructions/expired?date=2024-01-01
     */
    @GetMapping("/expired")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getExpiredMedicationInstructions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(medicationInstructionService.getExpiredMedicationInstructions(date));
    }

    /**
     * Get medication instructions by date range
     * GET /api/v1/medication-instructions/date-range?startDate=2024-01-01&endDate=2024-01-31
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getMedicationInstructionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(medicationInstructionService.getMedicationInstructionsByDateRange(startDate, endDate));
    }

    /**
     * Get medication instructions by parent provided status
     * GET /api/v1/medication-instructions/parent-provided/{parentProvided}
     */
    @GetMapping("/parent-provided/{parentProvided}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getParentProvidedMedicationInstructions(@PathVariable Boolean parentProvided) {
        return ResponseEntity.ok(medicationInstructionService.getParentProvidedMedicationInstructions(parentProvided));
    }

    /**
     * Create a new medication instruction (Admin/Nurse only)
     * POST /api/v1/medication-instructions
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<MedicationInstructionDTO> createMedicationInstruction(@RequestBody MedicationInstructionDTO medicationInstructionDTO) {
        return ResponseEntity.ok(medicationInstructionService.createMedicationInstruction(medicationInstructionDTO));
    }

    /**
     * Update a medication instruction (Admin/Nurse only)
     * PUT /api/v1/medication-instructions/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<MedicationInstructionDTO> updateMedicationInstruction(@PathVariable Long id, @RequestBody MedicationInstructionDTO medicationInstructionDTO) {
        return ResponseEntity.ok(medicationInstructionService.updateMedicationInstruction(id, medicationInstructionDTO));
    }

    /**
     * Delete a medication instruction (Admin only)
     * DELETE /api/v1/medication-instructions/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedicationInstruction(@PathVariable Long id) {
        medicationInstructionService.deleteMedicationInstruction(id);
        return ResponseEntity.noContent().build();
    }
}
