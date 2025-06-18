package com.fpt.medically_be.controller;


import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.request.Notification2UpdateDTO;
import com.fpt.medically_be.dto.response.Notification2ReceiveResponse;
import com.fpt.medically_be.dto.response.Notification2ResponseDTO;
import com.fpt.medically_be.service.Notification2Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")

@Tag(name = "Gửi thông báo đến phụ huynh", description = "API quản lý notification gửi đến phụ huynh")
public class NotificationController {

    @Autowired
    public Notification2Service notification2Service;

    @Operation(summary = "Tạo thông báo mới", description = "Tạo một thông báo mới gửi đến phụ huynh")
    @PreAuthorize("hasRole('NURSE')")
    @PostMapping("/create")
    public ResponseEntity<Notification2ResponseDTO> createNotification(@Valid @RequestBody Notification2RequestDTO notification2RequestDTO) {


        return ResponseEntity.ok(notification2Service.createNotification(notification2RequestDTO));
        }

      @Operation(summary = "Lấy danh sách thông báo", description = "Lấy danh sách thông báo đã gửi đến phụ huynh")
    @GetMapping("/getTitlesByParentId/{parentId}")
    public ResponseEntity<?> getNotificationTitlesByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(notification2Service.getNotificationTitlesByParentId(parentId));
    }

    @Operation(summary = "Lấy chi tiết thông báo", description = "Lấy chi tiết thông báo theo ID và ID phụ huynh")
    @GetMapping("/getDetail/{notiId}/{parentId}")
    public ResponseEntity<?> getNotificationDetail(@PathVariable Long notiId, @PathVariable Long parentId) {
        return ResponseEntity.ok(notification2Service.getNotificationDetail(notiId, parentId));
    }

        @Operation(summary = "Lấy thông báo theo ID phụ huynh", description = "Lấy danh sách thông báo theo ID phụ huynh")
        @GetMapping("/getByParentId/{parentId}")
        public ResponseEntity<?> getNotificationsByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(notification2Service.getNotificationsByParentId(parentId));
        }

    @Operation(summary = "Phản hồi của phụ huynh", description = "dùng để update phản hồi của phụ huynh đối với thông báo")
    @PutMapping("/notifications/respond")
    public ResponseEntity<Notification2ReceiveResponse> respondToNotification(@RequestBody Notification2UpdateDTO request) {


        return ResponseEntity.ok(notification2Service.respondToNotification(request));
    }



        }



