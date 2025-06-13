package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.HealthProfileDTO;
import com.fpt.medically_be.service.HealthProfileService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-profiles")
public class HealthProfileController {

    private final HealthProfileService healthProfileService;

    @Autowired
    public HealthProfileController(HealthProfileService healthProfileService) {
        this.healthProfileService = healthProfileService;
    }

    @GetMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<HealthProfileDTO>> getAllHealthProfiles() {
        return ResponseEntity.ok(healthProfileService.getAllHealthProfiles());
    }

    @GetMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<HealthProfileDTO> getHealthProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(healthProfileService.getHealthProfileById(id));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "API lấy hồ sơ y tế theo ID học sinh")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<HealthProfileDTO> getHealthProfileByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(healthProfileService.getHealthProfileByStudentId(studentId));
    }

    @PostMapping("/student-profiles")
    @Operation(summary = "API lấy nhiều hồ sơ y tế theo danh sách ID học sinh")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<HealthProfileDTO>> getHealthProfilesByStudentIds(@RequestBody List<Long> studentIds) {
        return ResponseEntity.ok(healthProfileService.getHealthProfilesByStudentIds(studentIds));
    }

    @PostMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<HealthProfileDTO> createHealthProfile(@RequestBody HealthProfileDTO healthProfileDTO) {
        return ResponseEntity.ok(healthProfileService.createHealthProfile(healthProfileDTO));
    }

    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<HealthProfileDTO> updateHealthProfile(@PathVariable Long id, @RequestBody HealthProfileDTO healthProfileDTO) {
        return ResponseEntity.ok(healthProfileService.updateHealthProfile(id, healthProfileDTO));
    }

    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHealthProfile(@PathVariable Long id) {
        healthProfileService.deleteHealthProfile(id);
        return ResponseEntity.noContent().build();
    }
}
