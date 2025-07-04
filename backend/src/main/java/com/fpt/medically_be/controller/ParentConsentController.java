package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.ParentConsentRequestDTO;
import com.fpt.medically_be.dto.response.ParentConsentResponseDTO;
import com.fpt.medically_be.service.ParentConsentService;
import com.fpt.medically_be.service.HealthCampaignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/parent-consents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Xác nhận của phụ huynh", description = "API quản lý xác nhận của phụ huynh cho kiểm tra y tế")
public class ParentConsentController {

    private final ParentConsentService parentConsentService;
    private final HealthCampaignService healthCampaignService;

    /**
     * Lấy danh sách xác nhận theo chiến dịch
     * GET /api/v1/parent-consents/campaign/{campaignId}
     */
    @GetMapping("/campaign/{campaignId}")
    @Operation(summary = "Lấy danh sách xác nhận của phụ huynh theo chiến dịch")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<List<ParentConsentResponseDTO>> getConsentsByCampaign(@PathVariable Long campaignId) {
        List<ParentConsentResponseDTO> consents = parentConsentService.getConsentsByHealthCampaign(campaignId);
        return ResponseEntity.ok(consents);
    }

    /**
     * Lấy danh sách xác nhận của phụ huynh cho một học sinh
     * GET /api/v1/parent-consents/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    @Operation(summary = "Lấy danh sách xác nhận của phụ huynh cho một học sinh")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy học sinh")
    })
    public ResponseEntity<List<ParentConsentResponseDTO>> getConsentsByStudent(@PathVariable Long studentId) {
        List<ParentConsentResponseDTO> consents = parentConsentService.getConsentsByStudent(studentId);
        return ResponseEntity.ok(consents);
    }

    /**
     * Lấy danh sách xác nhận của phụ huynh cụ thể
     * GET /api/v1/parent-consents/parent/{parentId}
     */
    @GetMapping("/parent/{parentId}")
    @Operation(summary = "Lấy danh sách xác nhận của phụ huynh cụ thể")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy phụ huynh")
    })
    public ResponseEntity<List<ParentConsentResponseDTO>> getConsentsByParent(@PathVariable Long parentId) {
        List<ParentConsentResponseDTO> consents = parentConsentService.getConsentsByParent(parentId);
        return ResponseEntity.ok(consents);
    }

    /**
     * Lấy xác nhận của phụ huynh cho một học sinh trong một chiến dịch cụ thể
     * GET /api/v1/parent-consents/campaign/{campaignId}/student/{studentId}
     */
    @GetMapping("/campaign/{campaignId}/student/{studentId}")
    @Operation(summary = "Lấy xác nhận của phụ huynh cho học sinh trong chiến dịch cụ thể")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy xác nhận thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy xác nhận")
    })
    public ResponseEntity<ParentConsentResponseDTO> getConsentByCampaignAndStudent(
            @PathVariable Long campaignId,
            @PathVariable Long studentId) {
        ParentConsentResponseDTO consent = parentConsentService.getConsentByHealthCampaignAndStudent(campaignId, studentId);
        return ResponseEntity.ok(consent);
    }

    /**
     * Cập nhật xác nhận của phụ huynh
     * PUT /api/v1/parent-consents/{consentId}
     */
    @PutMapping("/{consentId}")
    @Operation(summary = "Cập nhật xác nhận của phụ huynh")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy xác nhận")
    })
    public ResponseEntity<ParentConsentResponseDTO> updateParentConsent(
            @PathVariable Long consentId,
            @RequestBody ParentConsentRequestDTO requestDTO) {
        ParentConsentResponseDTO updatedConsent = parentConsentService.updateParentConsent(consentId, requestDTO);
        return ResponseEntity.ok(updatedConsent);
    }

    /**
     * Lấy danh sách phụ huynh đã đồng ý cho con tham gia kiểm tra trong một chiến dịch
     * GET /api/v1/parent-consents/campaign/{campaignId}/approved
     */
    @GetMapping("/campaign/{campaignId}/approved")
    @Operation(summary = "Lấy danh sách phụ huynh đã đồng ý cho con tham gia kiểm tra")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<List<ParentConsentResponseDTO>> getApprovedConsentsForCampaign(@PathVariable Long campaignId) {
        List<ParentConsentResponseDTO> consents = parentConsentService.getApprovedConsentsForCampaign(campaignId);
        return ResponseEntity.ok(consents);
    }

    /**
     * Đếm số lượng xác nhận theo trạng thái cho một chiến dịch
     * GET /api/v1/parent-consents/campaign/{campaignId}/count
     */
    @GetMapping("/campaign/{campaignId}/count")
    @Operation(summary = "Đếm số lượng xác nhận theo trạng thái cho một chiến dịch")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đếm thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<Map<String, Long>> countConsentsByCampaign(@PathVariable Long campaignId) {
        Long totalConsents = parentConsentService.countConsentsByHealthCampaign(campaignId);
        Long approvedConsents = parentConsentService.countApprovedConsentsByHealthCampaign(campaignId);
        Long pendingConsents = totalConsents - approvedConsents;

        Map<String, Long> counts = new HashMap<>();
        counts.put("total", totalConsents);
        counts.put("approved", approvedConsents);
        counts.put("pending", pendingConsents);

        return ResponseEntity.ok(counts);
    }

    /**
     * Gửi nhắc nhở cho phụ huynh chưa xác nhận
     * POST /api/v1/parent-consents/campaign/{campaignId}/send-reminders
     */
    @PostMapping("/campaign/{campaignId}/send-reminders")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Gửi nhắc nhở cho phụ huynh chưa xác nhận")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Gửi nhắc nhở thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<Map<String, Object>> sendRemindersToParents(@PathVariable Long campaignId) {
        int remindersSent = parentConsentService.sendRemindersToParents(campaignId);

        Map<String, Object> response = new HashMap<>();
        response.put("campaignId", campaignId);
        response.put("remindersSent", remindersSent);

        return ResponseEntity.ok(response);
    }

    /**
     * Phụ huynh xem thông tin chi tiết consent để lựa chọn
     * GET /api/v1/parent-consents/{consentId}/details
     */
    @GetMapping("/{consentId}/details")
    @Operation(summary = "Phụ huynh xem chi tiết thông báo kiểm tra y tế")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy thông tin thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thông báo")
    })
    public ResponseEntity<Map<String, Object>> getConsentDetails(@PathVariable Long consentId) {
        ParentConsentResponseDTO consent = parentConsentService.getParentConsentById(consentId);

        // Lấy danh sách các mục kiểm tra đặc biệt có thể chọn từ chiến dịch
        List<String> availableSpecialItems = healthCampaignService.getSpecialCheckupItems(consent.getHealthCampaignId());

        Map<String, Object> response = new HashMap<>();
        response.put("consent", consent);
        response.put("campaignTitle", consent.getCampaignTitle()); // Sửa từ getHealthCampaignTitle()
        response.put("campaignDescription", consent.getCampaignDescription()); // Sửa từ getHealthCampaignDescription()
        response.put("studentName", consent.getStudentName());
        response.put("availableSpecialCheckupItems", availableSpecialItems);
        response.put("selectedSpecialCheckupItems", consent.getSpecialCheckupItems());
        response.put("isConsentGiven", consent.getConsentGiven());

        return ResponseEntity.ok(response);
    }
}
