package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.HealthProfileDTO;
import com.fpt.medically_be.dto.request.HealthProfileRequestDTO;
import com.fpt.medically_be.service.HealthProfileService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;
import java.util.HashMap;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/health-profiles")
public class HealthProfileController {

    private final HealthProfileService healthProfileService;

    @Autowired
    public HealthProfileController(HealthProfileService healthProfileService) {
        this.healthProfileService = healthProfileService;
    }


    @GetMapping("/all-health-profiles")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<Page<HealthProfileDTO>> getAllHealthProfiles(@RequestParam (defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(healthProfileService.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<HealthProfileDTO> getHealthProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(healthProfileService.getHealthProfileById(id));

    }

    @GetMapping("/student/{studentId}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    @Operation(summary = "Lấy hồ sơ sức khỏe theo studentId")
    public ResponseEntity<HealthProfileDTO> getHealthProfileByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(healthProfileService.getHealthProfileByStudentId(studentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE')")
    public ResponseEntity<HealthProfileDTO> createHealthProfile(@Valid @RequestBody HealthProfileRequestDTO healthProfileRequestDTO) {
        // Log the incoming request for debugging
        System.out.println("Received health profile request: " + healthProfileRequestDTO);
        return ResponseEntity.ok(healthProfileService.createHealthProfile(healthProfileRequestDTO));
    }

    @PostMapping("/create-or-update")
    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE')")
    public ResponseEntity<HealthProfileDTO> createOrUpdateHealthProfile(@Valid @RequestBody HealthProfileRequestDTO healthProfileRequestDTO) {
        // Log the incoming request for debugging
        System.out.println("Received create/update health profile request: " + healthProfileRequestDTO);
        
        if (healthProfileRequestDTO.getId() == null) {
            throw new IllegalArgumentException("Student ID must not be null");
        }
        
        try {
            // Try to get existing health profile
            HealthProfileDTO existingProfile = healthProfileService.getHealthProfileByStudentId(healthProfileRequestDTO.getId());
            // If it exists, update it
            return ResponseEntity.ok(healthProfileService.updateHealthProfile(existingProfile.getId(), healthProfileRequestDTO));
        } catch (EntityNotFoundException e) {
            // If it doesn't exist, create new one
            return ResponseEntity.ok(healthProfileService.createHealthProfile(healthProfileRequestDTO));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE')")
    public ResponseEntity<HealthProfileDTO> updateHealthProfile(@PathVariable Long id, @Valid @RequestBody HealthProfileRequestDTO requestDTO) {
        return ResponseEntity.ok(healthProfileService.updateHealthProfile(id, requestDTO));
    }

    @PutMapping("/student/{studentId}")
    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE')")
    public ResponseEntity<HealthProfileDTO> updateHealthProfileByStudentId(@PathVariable Long studentId, @Valid @RequestBody HealthProfileRequestDTO requestDTO) {
        // Set the studentId in the request DTO
        requestDTO.setId(studentId);
        
        try {
            // Try to get existing health profile
            HealthProfileDTO existingProfile = healthProfileService.getHealthProfileByStudentId(studentId);
            // If it exists, update it
            return ResponseEntity.ok(healthProfileService.updateHealthProfile(existingProfile.getId(), requestDTO));
        } catch (EntityNotFoundException e) {
            // If it doesn't exist, create new one
            return ResponseEntity.ok(healthProfileService.createHealthProfile(requestDTO));
        }
    }

    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHealthProfile(@PathVariable Long id) {
        healthProfileService.deleteHealthProfile(id);
        return ResponseEntity.noContent().build();
    }

    // Error handler for validation errors
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}
