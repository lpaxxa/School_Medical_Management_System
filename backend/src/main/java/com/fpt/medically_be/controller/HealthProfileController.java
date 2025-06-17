package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.HealthProfileDTO;
import com.fpt.medically_be.service.HealthProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;
import java.util.List;

@RestController
@RequestMapping("/api/v1/health-profiles")
public class HealthProfileController {

    private final HealthProfileService healthProfileService;

    @Autowired
    public HealthProfileController(HealthProfileService healthProfileService) {
        this.healthProfileService = healthProfileService;
    }

    @GetMapping("/all-health-profiles")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<Page<HealthProfileDTO>> getAllHealthProfiles(@RequestParam (defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(healthProfileService.findAll(pageable));
    }

    @GetMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<HealthProfileDTO> getHealthProfileById(@PathVariable Long studentId) {
        return ResponseEntity.ok(healthProfileService.getHealthProfileById(studentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE')")
    public ResponseEntity<HealthProfileDTO> createHealthProfile(@RequestBody HealthProfileDTO healthProfileDTO) {
        return ResponseEntity.ok(healthProfileService.createHealthProfile(healthProfileDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE')")
    public ResponseEntity<HealthProfileDTO> updateHealthProfile(@PathVariable Long id, @RequestBody HealthProfileDTO healthProfileDTO) {
        return ResponseEntity.ok(healthProfileService.updateHealthProfile(id, healthProfileDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHealthProfile(@PathVariable Long id) {
        healthProfileService.deleteHealthProfile(id);
        return ResponseEntity.noContent().build();
    }
}
