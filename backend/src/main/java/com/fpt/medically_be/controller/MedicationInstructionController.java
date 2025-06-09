package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.MedicationInstructionDTO;
import com.fpt.medically_be.service.MedicationInstructionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medication-instructions")
public class MedicationInstructionController {

    private final MedicationInstructionService medicationInstructionService;

    @Autowired
    public MedicationInstructionController(MedicationInstructionService medicationInstructionService) {
        this.medicationInstructionService = medicationInstructionService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getAllMedicationInstructions() {
        return ResponseEntity.ok(medicationInstructionService.getAllMedicationInstructions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<MedicationInstructionDTO> getMedicationInstructionById(@PathVariable Long id) {
        return ResponseEntity.ok(medicationInstructionService.getMedicationInstructionById(id));
    }

    @GetMapping("/health-profile/{healthProfileId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<MedicationInstructionDTO>> getMedicationInstructionsByHealthProfileId(@PathVariable Long healthProfileId) {
        return ResponseEntity.ok(medicationInstructionService.getMedicationInstructionsByHealthProfileId(healthProfileId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getMedicationInstructionsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(medicationInstructionService.getMedicationInstructionsByStatus(status));
    }

    @GetMapping("/expired")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getExpiredMedicationInstructions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(medicationInstructionService.getExpiredMedicationInstructions(date));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getMedicationInstructionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(medicationInstructionService.getMedicationInstructionsByDateRange(startDate, endDate));
    }

    @GetMapping("/parent-provided/{parentProvided}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<MedicationInstructionDTO>> getParentProvidedMedicationInstructions(@PathVariable Boolean parentProvided) {
        return ResponseEntity.ok(medicationInstructionService.getParentProvidedMedicationInstructions(parentProvided));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<MedicationInstructionDTO> createMedicationInstruction(@RequestBody MedicationInstructionDTO medicationInstructionDTO) {
        return ResponseEntity.ok(medicationInstructionService.createMedicationInstruction(medicationInstructionDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<MedicationInstructionDTO> updateMedicationInstruction(@PathVariable Long id, @RequestBody MedicationInstructionDTO medicationInstructionDTO) {
        return ResponseEntity.ok(medicationInstructionService.updateMedicationInstruction(id, medicationInstructionDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedicationInstruction(@PathVariable Long id) {
        medicationInstructionService.deleteMedicationInstruction(id);
        return ResponseEntity.noContent().build();
    }
}
