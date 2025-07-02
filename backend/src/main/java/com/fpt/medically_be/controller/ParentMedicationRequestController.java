package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.MedicationRequestDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.service.MedicationInstructionService;
import com.fpt.medically_be.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for Parent Medication Request operations
 * Handles parent-initiated medication requests for their children
 */
@RestController
@RequestMapping("/api/v1/parent-medication-requests")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('PARENT')")
public class ParentMedicationRequestController {

    private static final Logger logger = LoggerFactory.getLogger(ParentMedicationRequestController.class);
    
    private final MedicationInstructionService medicationInstructionService;
    private final NotificationService notificationService;

    @Autowired
    public ParentMedicationRequestController(MedicationInstructionService medicationInstructionService, 
                                           NotificationService notificationService) {
        this.medicationInstructionService = medicationInstructionService;
        this.notificationService = notificationService;
    }


    @PostMapping("/submit-request")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Điền form gửi thuốc cho học sinh")
    public ResponseEntity<MedicationInstructionDTO> submitMedicationRequest(
            @Valid @RequestBody MedicationRequestDTO request, 
            Authentication auth) {
        
        try {
            MedicationInstructionDTO result = medicationInstructionService.createParentMedicationRequest(request, auth);
            
            // Notify nurses about the new medication request
            notificationService.sendNotificationToNurses(result);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error submitting medication request for parent: {}", auth.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Xem danh sách Tất Cả yêu cầu gửi thuốc của phụ huynh (history)")
    public ResponseEntity<List<MedicationInstructionDTO>> getMyMedicationRequests(Authentication auth) {
        List<MedicationInstructionDTO> requests = medicationInstructionService.getParentMedicationRequests(auth);
        return ResponseEntity.ok(requests);
    }

    //view requests by specific child
    @GetMapping("/child/{studentId}")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Xem danh sách yêu cầu gửi thuốc bằng id học sinh")
    public ResponseEntity<List<MedicationInstructionDTO>> getMedicationRequestsByChild(
            @PathVariable Long studentId, 
            Authentication auth) {
        
        List<MedicationInstructionDTO> requests = medicationInstructionService.getMedicationRequestsByChild(studentId, auth);
        return ResponseEntity.ok(requests);
    }

    //cancel medication request - moved before generic {requestId} mapping
    @DeleteMapping("/cancel-request/{requestId}")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Hủy yêu cầu gửi thuốc, nếu status vẫn là PENDING_APPROVAL")
    public ResponseEntity<?> cancelMedicationRequest(
            @PathVariable Long requestId,
            Authentication auth) {
        medicationInstructionService.cancelMedicationRequest(requestId,auth);

        return ResponseEntity.ok("Yêu cầu gửi thuốc đã được hủy thành công");
    }

    //update medication request
    @PutMapping("/{requestId}")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Cập nhật yêu cầu gửi thuố, nếu status vẫn là PENDING_APPROVAL")
    public ResponseEntity<MedicationInstructionDTO> updateMedicationRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody MedicationRequestDTO request, 
            Authentication auth) {
        
        MedicationInstructionDTO result = medicationInstructionService.updateParentMedicationRequest(requestId, request, auth);
        return ResponseEntity.ok(result);
    }

    //view medication request by ID - moved to end to avoid conflicts
    @GetMapping("/{requestId}")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Xem chi tiết yêu cầu gửi thuốc bằng ID")
    public ResponseEntity<MedicationInstructionDTO> getMedicationRequestById(@PathVariable Long requestId) {
        MedicationInstructionDTO request = medicationInstructionService.getMedicationInstructionById(requestId);
        return ResponseEntity.ok(request);
    }

    @PostMapping(value = "/{id}/upload-confirmation-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<Map<String, Object>> uploadConfirmationImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {
        try {
            // Upload ảnh xác nhận và cập nhật thông tin bản ghi
            MedicationInstructionDTO updatedRecord =
                    medicationInstructionService.uploadConfirmationImage(id, image, authentication);

            // Kiểm tra xem imageUrl có null không
            String imageUrl = updatedRecord.getPrescriptionImageUrl();
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
} 