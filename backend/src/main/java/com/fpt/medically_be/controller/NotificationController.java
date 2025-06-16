package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.NotificationRequestDTO;
import com.fpt.medically_be.dto.response.NotificationUpdateDTO;
import com.fpt.medically_be.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")

public class NotificationController {

    @Autowired
    public NotificationService notificationService;

    @PostMapping("/create")
    public ResponseEntity<String> createNotification(@Valid @RequestBody NotificationRequestDTO notificationRequestDTO) {

        notificationService.createNotification(notificationRequestDTO);
        return ResponseEntity.ok("Notification created successfully");
        }

    @GetMapping("/getTitlesByParentId/{parentId}")
    public ResponseEntity<?> getNotificationTitlesByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(notificationService.getNotificationTitlesByParentId(parentId));
    }

    @GetMapping("/getDetail/{notiId}/{parentId}")
    public ResponseEntity<?> getNotificationDetail(@PathVariable Long notiId, @PathVariable Long parentId) {
        return ResponseEntity.ok(notificationService.getNotificationDetail(notiId, parentId));
    }


        @GetMapping("/getByParentId/{parentId}")
        public ResponseEntity<?> getNotificationsByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(notificationService.getNotificationsByParentId(parentId));
        }


    @PutMapping("/notifications/respond")
    public ResponseEntity<String> respondToNotification(@RequestBody NotificationUpdateDTO request) {
        notificationService.respondToNotification(request);

        return ResponseEntity.ok("Response to notification updated successfully");
    }



        }



