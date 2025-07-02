package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.request.MedicationAdministrationRequestDTO;
import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.entity.AdministrationStatus;
import com.fpt.medically_be.entity.Status;
import com.fpt.medically_be.service.MedicationAdministrationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * Controller for Medication Administration operations
 * Handles nurses recording when they give medications to students
 */
@RestController
@RequestMapping("/api/v1/medication-administrations")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('NURSE') or hasRole('PARENT')")
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
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
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
            @PathVariable Status status,
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

    @PostMapping(value = "/{id}/upload-confirmation-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<Map<String, Object>> uploadConfirmationImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {
        try {
            // Upload ảnh xác nhận và cập nhật thông tin bản ghi
            MedicationAdministrationResponseDTO updatedRecord =
                administrationService.uploadConfirmationImage(id, image, authentication);

            // Kiểm tra xem imageUrl có null không
            String imageUrl = updatedRecord.getConfirmationImageUrl();
            if (imageUrl == null || imageUrl.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "status", "error",
                        "message", "Không thể lưu ảnh xác nhận, URL trả về là null"
                    ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Đã tải lên ảnh xác nhận thành công");
            response.put("imageUrl", imageUrl);
            response.put("administrationRecord", updatedRecord);

            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
                ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
                ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", "error",
                    "message", "Lỗi khi tải lên ảnh: " + e.getMessage()
                ));
        }
    }


    // Non-paginated endpoints

    /**
     * Get all administration records for a specific medication instruction (no pagination)
     * GET /api/v1/medication-administrations/all/medication-instruction/{medicationInstructionId}
     */
    @GetMapping("/all/medication-instruction/{medicationInstructionId}")
    public ResponseEntity<Map<String, Object>> getAllAdministrationsByMedicationInstruction(
            @PathVariable Long medicationInstructionId) {
        List<MedicationAdministrationResponseDTO> administrations = administrationService.getAllAdministrationsByMedicationInstruction(medicationInstructionId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", administrations);
        response.put("count", administrations.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all administration records for a specific student (no pagination)
     * GET /api/v1/medication-administrations/all/student/{studentId}
     */
    @GetMapping("/all/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getAllAdministrationsByStudent(
            @PathVariable String studentId) {
        List<MedicationAdministrationResponseDTO> administrations = administrationService.getAllAdministrationsByStudent(studentId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", administrations);
        response.put("count", administrations.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all administration records by date range (no pagination)
     * GET /api/v1/medication-administrations/all/date-range?start=2024-01-01T09:00:00&end=2024-01-31T17:00:00
     */
    @GetMapping("/all/date-range")
    public ResponseEntity<Map<String, Object>> getAllAdministrationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<MedicationAdministrationResponseDTO> administrations = administrationService.getAllAdministrationsByDateRange(start, end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", administrations);
        response.put("count", administrations.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all administration records by status (no pagination)
     * GET /api/v1/medication-administrations/all/status/{status}
     */
    @GetMapping("/all/status/{status}")
    public ResponseEntity<Map<String, Object>> getAllAdministrationsByStatus(
            @PathVariable Status status) {
        List<MedicationAdministrationResponseDTO> administrations = administrationService.getAllAdministrationsByStatus(status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", administrations);
        response.put("count", administrations.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all recent administration records (no pagination)
     * GET /api/v1/medication-administrations/all/recent
     */
    @GetMapping("/all/recent")
    public ResponseEntity<Map<String, Object>> getAllRecentAdministrations() {
        List<MedicationAdministrationResponseDTO> administrations = administrationService.getAllRecentAdministrations();
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", administrations);
        response.put("count", administrations.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all administration records (no pagination)
     * GET /api/v1/medication-administrations/all
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllAdministrations() {
        List<MedicationAdministrationResponseDTO> administrations = administrationService.getAllAdministrations();
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", administrations);
        response.put("count", administrations.size());
        
        return ResponseEntity.ok(response);
    }


}

