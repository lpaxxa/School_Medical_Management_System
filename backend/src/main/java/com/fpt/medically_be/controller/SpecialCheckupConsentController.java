package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.SpecialCheckupConsentDTO;
import com.fpt.medically_be.service.SpecialCheckupConsentService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/special-checkup-consent")
@RequiredArgsConstructor
public class SpecialCheckupConsentController {

    private final SpecialCheckupConsentService specialCheckupConsentService;


    @Operation(summary = "Lấy danh sách các phần khám đặc biệt",
            description = "Lấy danh sách các phần khám đặc biệt cần phụ huynh xác nhận trong thông báo khám sức khỏe")
    @GetMapping("/{notificationRecipientId}")
    public ResponseEntity<List<SpecialCheckupConsentDTO>> getSpecialCheckupConsents(
            @PathVariable Long notificationRecipientId) {

        List<SpecialCheckupConsentDTO> consents = specialCheckupConsentService
                .getSpecialCheckupConsents(notificationRecipientId);

        return ResponseEntity.ok(consents);
    }


    @Operation(summary = "Cập nhật phản hồi của phụ huynh cho các phần khám đặc biệt",
            description = "Cập nhật phản hồi của phụ huynh cho các phần khám đặc biệt trong thông báo khám sức khỏe")
    @PutMapping("/{notificationRecipientId}")
    public ResponseEntity<String> updateConsentResponses(
            @PathVariable Long notificationRecipientId,
            @RequestBody List<SpecialCheckupConsentDTO> consentDTOs) {

        specialCheckupConsentService.updateConsentResponses(notificationRecipientId, consentDTOs);

        return ResponseEntity.ok("Cập nhật phản hồi thành công!");
    }
}
