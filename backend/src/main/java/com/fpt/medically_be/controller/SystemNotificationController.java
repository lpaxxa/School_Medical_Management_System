package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.response.SystemNotificationDTO;
import com.fpt.medically_be.service.SystemNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system-notifications")
@Tag(name = "System Notifications", description = "API quản lý thông báo in-app cho parents")
public class SystemNotificationController {

    private final SystemNotificationService systemNotificationService;

    @Autowired
    public SystemNotificationController(SystemNotificationService systemNotificationService) {
        this.systemNotificationService = systemNotificationService;
    }

    @GetMapping("/parent/{parentId}")
    @Operation(summary = "Lấy thông báo cho phụ huynh", 
               description = "Lấy danh sách tất cả thông báo in-app cho phụ huynh cụ thể.")
    public ResponseEntity<List<SystemNotificationDTO>> getNotificationsForParent(@PathVariable Long parentId) {
        return ResponseEntity.ok(systemNotificationService.getNotificationsForParent(parentId));
    }

    @GetMapping("/parent/{parentId}/unread")
    @Operation(summary = "Lấy thông báo chưa đọc", 
               description = "Lấy danh sách thông báo chưa đọc cho phụ huynh.")
    public ResponseEntity<List<SystemNotificationDTO>> getUnreadNotificationsForParent(@PathVariable Long parentId) {
        return ResponseEntity.ok(systemNotificationService.getUnreadNotificationsForParent(parentId));
    }

    @PutMapping("/{notificationId}/mark-read")
    @Operation(summary = "Đánh dấu đã đọc", 
               description = "Đánh dấu thông báo là đã đọc.")
    public ResponseEntity<SystemNotificationDTO> markNotificationAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(systemNotificationService.markAsRead(notificationId));
    }

    @PutMapping("/parent/{parentId}/mark-all-read")
    @Operation(summary = "Đánh dấu tất cả đã đọc", 
               description = "Đánh dấu tất cả thông báo của phụ huynh là đã đọc.")
    public ResponseEntity<String> markAllNotificationsAsRead(@PathVariable Long parentId) {
        systemNotificationService.markAllAsReadForParent(parentId);
        return ResponseEntity.ok("Đã đánh dấu tất cả thông báo là đã đọc.");
    }

    @GetMapping("/parent/{parentId}/count/unread")
    @Operation(summary = "Đếm thông báo chưa đọc", 
               description = "Đếm số lượng thông báo chưa đọc của phụ huynh.")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long parentId) {
        return ResponseEntity.ok(systemNotificationService.getUnreadCount(parentId));
    }
}