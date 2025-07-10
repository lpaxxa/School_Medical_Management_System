package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.MedicalCheckupRequestDTO;
import com.fpt.medically_be.dto.response.MedicalCheckupResponseDTO;
import com.fpt.medically_be.entity.CheckupStatus;
import com.fpt.medically_be.service.MedicalCheckupService;
import com.fpt.medically_be.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/medical-checkups")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Kiểm tra y tế", description = "API quản lý kiểm tra y tế định kỳ")
public class MedicalCheckupController {

    private final MedicalCheckupService medicalCheckupService;
    private final EmailService emailService;

    /**
     * Lấy danh sách tất cả các kiểm tra y tế
     * GET /api/v1/medical-checkups
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các kiểm tra y tế")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<List<MedicalCheckupResponseDTO>> getAllMedicalCheckups() {
        List<MedicalCheckupResponseDTO> checkups = medicalCheckupService.getAllMedicalCheckups();
        return ResponseEntity.ok(checkups);
    }

    /**
     * Lấy thông tin chi tiết một kiểm tra y tế theo ID
     * GET /api/v1/medical-checkups/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết kiểm tra y tế theo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy thông tin thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy kiểm tra y tế")
    })
    public ResponseEntity<MedicalCheckupResponseDTO> getMedicalCheckupById(@PathVariable Long id) {
        MedicalCheckupResponseDTO checkup = medicalCheckupService.getMedicalCheckupById(id);
        return ResponseEntity.ok(checkup);
    }

    /**
     * Tạo lịch kiểm tra mới cho học sinh (Bước 7)
     * POST /api/v1/medical-checkups
     */
    @PostMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Tạo lịch kiểm tra y tế mới")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tạo lịch kiểm tra thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
    })
    public ResponseEntity<MedicalCheckupResponseDTO> createMedicalCheckup(@RequestBody MedicalCheckupRequestDTO dto) {
        MedicalCheckupResponseDTO createdCheckup = medicalCheckupService.createMedicalCheckup(dto);
        return new ResponseEntity<>(createdCheckup, HttpStatus.CREATED);
    }

    /**
     * Cập nhật kết quả kiểm tra y tế (Bước 8)
     * PUT /api/v1/medical-checkups/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Cập nhật kết quả kiểm tra y tế")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy kiểm tra y tế")
    })
    public ResponseEntity<MedicalCheckupResponseDTO> updateMedicalCheckup(
            @PathVariable Long id,
            @RequestBody MedicalCheckupRequestDTO dto) {
        MedicalCheckupResponseDTO updatedCheckup = medicalCheckupService.updateMedicalCheckup(id, dto);
        return ResponseEntity.ok(updatedCheckup);
    }

    /**
     * Cập nhật trạng thái kiểm tra y tế
     * PATCH /api/v1/medical-checkups/{id}/status
     */
    @PatchMapping("/{id}/status")
//    @PreAuthorize("hasRole('NURSE')")
    @Operation(summary = "Cập nhật trạng thái kiểm tra y tế")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật trạng thái thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy kiểm tra y tế")
    })
    public ResponseEntity<MedicalCheckupResponseDTO> updateMedicalCheckupStatus(
            @PathVariable Long id,
            @RequestParam CheckupStatus status) {
        MedicalCheckupResponseDTO updatedCheckup = medicalCheckupService.updateMedicalCheckupStatus(id, status);
        return ResponseEntity.ok(updatedCheckup);
    }

    /**
     * Lấy danh sách kiểm tra y tế theo chiến dịch
     * GET /api/v1/medical-checkups/campaign/{campaignId}
     */
    @GetMapping("/campaign/{campaignId}")
    @Operation(summary = "Lấy danh sách kiểm tra y tế theo chiến dịch")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<List<MedicalCheckupResponseDTO>> getMedicalCheckupsByCampaign(@PathVariable Long campaignId) {
        List<MedicalCheckupResponseDTO> checkups = medicalCheckupService.getMedicalCheckupsByHealthCampaign(campaignId);
        return ResponseEntity.ok(checkups);
    }

    /**
     * Lấy danh sách kiểm tra y tế theo trạng thái và chiến dịch
     * GET /api/v1/medical-checkups/campaign/{campaignId}/status/{status}
     */
    @GetMapping("/campaign/{campaignId}/status/{status}")
    @Operation(summary = "Lấy danh sách kiểm tra y tế theo trạng thái và chiến dịch")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<List<MedicalCheckupResponseDTO>> getMedicalCheckupsByCampaignAndStatus(
            @PathVariable Long campaignId,
            @PathVariable CheckupStatus status) {
        List<MedicalCheckupResponseDTO> checkups = medicalCheckupService.getMedicalCheckupsByHealthCampaignAndStatus(campaignId, status);
        return ResponseEntity.ok(checkups);
    }

    /**
     * Lấy danh sách kiểm tra y tế theo học sinh
     * GET /api/v1/medical-checkups/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    @Operation(summary = "Lấy lịch sử kiểm tra của học sinh")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy lịch sử thành công")
    })
    public ResponseEntity<List<MedicalCheckupResponseDTO>> getCheckupHistoryByStudent(@PathVariable Long studentId) {
        List<MedicalCheckupResponseDTO> history = medicalCheckupService.getCheckupHistoryByStudent(studentId);
        return ResponseEntity.ok(history);
    }

    /**
     * Lấy danh sách kiểm tra y tế theo nhân viên y tế
     * GET /api/v1/medical-checkups/staff/{staffId}
     */
    @GetMapping("/staff/{staffId}")
    @Operation(summary = "Lấy danh sách kiểm tra y tế theo nhân viên y tế")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy nhân viên y tế")
    })
    public ResponseEntity<List<MedicalCheckupResponseDTO>> getMedicalCheckupsByStaff(@PathVariable Long staffId) {
        List<MedicalCheckupResponseDTO> checkups = medicalCheckupService.getMedicalCheckupsByMedicalStaff(staffId);
        return ResponseEntity.ok(checkups);
    }

    /**
     * Lấy danh sách kiểm tra y tế theo khoảng thời gian
     * GET /api/v1/medical-checkups/date-range
     */
    @GetMapping("/date-range")
    @Operation(summary = "Lấy danh sách kiểm tra y tế theo khoảng thời gian")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<List<MedicalCheckupResponseDTO>> getMedicalCheckupsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<MedicalCheckupResponseDTO> checkups = medicalCheckupService.getMedicalCheckupsByDateRange(startDate, endDate);
        return ResponseEntity.ok(checkups);
    }

    /**
     * Xóa kiểm tra y tế
     * DELETE /api/v1/medical-checkups/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Xóa kiểm tra y tế")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy kiểm tra y tế")
    })
    public ResponseEntity<Void> deleteMedicalCheckup(@PathVariable Long id) {
        medicalCheckupService.deleteMedicalCheckup(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Gửi kết quả kiểm tra cho phụ huynh (Bước 9)
     * POST /api/v1/medical-checkups/{id}/send-results
     */
    @PostMapping("/{id}/send-results")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Gửi kết quả kiểm tra cho phụ huynh")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Gửi kết quả thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy kiểm tra y tế")
    })
    public ResponseEntity<Map<String, Object>> sendResultsToParent(@PathVariable Long id) {
        boolean sent = medicalCheckupService.sendResultsToParent(id);

        Map<String, Object> response = new HashMap<>();
        response.put("checkupId", id);
        response.put("resultSent", sent);
        response.put("message", sent ? "Kết quả đã được gửi thành công" : "Gửi kết quả thất bại");

        return ResponseEntity.ok(response);
    }

    /**
     * Gửi thông báo kết quả khám sức khỏe cho phụ huynh qua email
     * POST /api/v1/medical-checkups/{checkupId}/notify-parent
     */
    @PostMapping("/{checkupId}/notify-parent")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Gửi thông báo kết quả khám sức khỏe cho phụ huynh")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Gửi email thông báo thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy kiểm tra y tế"),
            @ApiResponse(responseCode = "500", description = "Lỗi khi gửi email")
    })
    public ResponseEntity<Map<String, Object>> notifyParent(@PathVariable Long checkupId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            emailService.sendHealthCheckupNotificationByCheckupId(checkupId);
            
            response.put("checkupId", checkupId);
            response.put("emailSent", true);
            response.put("message", "Email thông báo kết quả khám sức khỏe đã được gửi thành công");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("checkupId", checkupId);
            response.put("emailSent", false);
            response.put("message", "Gửi email thất bại: " + e.getMessage());
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @PostMapping("/batch-notify-parents")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Gửi thông báo kết quả khám sức khỏe cho nhiều phụ huynh",
            description = "Gửi email thông báo kết quả khám sức khỏe cho nhiều phụ huynh dựa trên danh sách ID các đợt khám.")
    public ResponseEntity<String> sendBatchHealthNotificationsToParents(@RequestBody List<Long> checkupIds) {
        try {
            emailService.sendBatchHealthCheckupNotifications(checkupIds);
            return ResponseEntity.ok(String.format("Đã gửi thành công thông báo cho %d đợt khám sức khỏe.", checkupIds.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gửi email thất bại: " + e.getMessage());
        }
    }



/**
     * Lấy danh sách học sinh cần theo dõi thêm theo chiến dịch (Bước 11)
     * GET /api/v1/medical-checkups/campaign/{campaignId}/follow-up
     */
    @GetMapping("/campaign/{campaignId}/follow-up")
    @Operation(summary = "Lấy danh sách học sinh cần theo dõi thêm")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<List<MedicalCheckupResponseDTO>> getStudentsNeedingFollowUp(@PathVariable Long campaignId) {
        List<MedicalCheckupResponseDTO> followUpStudents = medicalCheckupService.getStudentsNeedingFollowUp(campaignId);
        return ResponseEntity.ok(followUpStudents);
    }

    /**
     * Lấy danh sách kiểm tra theo trạng thái
     * GET /api/v1/medical-checkups/status/{status}
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy danh sách kiểm tra theo trạng thái")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<List<MedicalCheckupResponseDTO>> getCheckupsByStatus(@PathVariable CheckupStatus status) {
        List<MedicalCheckupResponseDTO> checkups = medicalCheckupService.getCheckupsByStatus(status);
        return ResponseEntity.ok(checkups);
    }

    /**
     * Lấy danh sách kiểm tra theo ngày
     * GET /api/v1/medical-checkups/date/{date}
     */
    @GetMapping("/date/{date}")
    @Operation(summary = "Lấy danh sách kiểm tra theo ngày")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<List<MedicalCheckupResponseDTO>> getCheckupsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<MedicalCheckupResponseDTO> checkups = medicalCheckupService.getCheckupsByDate(date);
        return ResponseEntity.ok(checkups);
    }

    /**
     * Lên lịch tư vấn sức khỏe cho học sinh cần theo dõi
     * POST /api/v1/medical-checkups/{id}/schedule-consultation
     */
    @PostMapping("/{id}/schedule-consultation")
    @PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
    @Operation(summary = "Lên lịch tư vấn sức khỏe cho học sinh cần theo dõi")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lên lịch tư vấn thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy kiểm tra y tế")
    })
    public ResponseEntity<Map<String, Object>> scheduleHealthConsultation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> consultationDetails) {
        boolean scheduled = medicalCheckupService.scheduleHealthConsultation(id, consultationDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("checkupId", id);
        response.put("consultationScheduled", scheduled);
        response.put("consultationDetails", consultationDetails);

        return ResponseEntity.ok(response);
    }
}

