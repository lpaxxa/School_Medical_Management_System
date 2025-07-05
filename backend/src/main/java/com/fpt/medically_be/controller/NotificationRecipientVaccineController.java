package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.ConfirmVaccinesRequest;
import com.fpt.medically_be.entity.NotificationRecipientVaccine;
import com.fpt.medically_be.service.NotificationRecipientVaccineService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/notification-recipient-vaccines")
public class NotificationRecipientVaccineController {
    @Autowired
    private NotificationRecipientVaccineService notificationRecipientVaccineService;

    @Operation(summary = "phụ huynh xác nhận tiêm chủng những vaccine nào")
    @PostMapping("/create")
    public ResponseEntity<String> createNotificationRecipientVaccine(@RequestBody ConfirmVaccinesRequest request) {
        try {
            notificationRecipientVaccineService.confirmVaccines(request);
            return ResponseEntity.ok("Notification Recipient Vaccine created successfully");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create: " + ex.getMessage());
        }
    }
}
