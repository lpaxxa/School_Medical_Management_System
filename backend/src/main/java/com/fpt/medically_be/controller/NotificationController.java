package com.fpt.medically_be.controller;


import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.request.Notification2UpdateDTO;
import com.fpt.medically_be.dto.response.Notification2ReceiveResponse;
import com.fpt.medically_be.dto.response.Notification2ResponseDTO;
import com.fpt.medically_be.dto.response.Notification2ResponseStatusDTO;
import com.fpt.medically_be.entity.NotificationType;
import com.fpt.medically_be.entity.ResponseStatus;
import com.fpt.medically_be.service.Notification2Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")

@Tag(name = "Gửi thông báo đến phụ huynh", description = "API quản lý notification gửi đến phụ huynh")
public class NotificationController {

    @Autowired
    public Notification2Service notification2Service;

    @Operation(summary = "Tạo thông báo mới", description = "Tạo một thông báo mới gửi đến phụ huynh")
//    @PreAuthorize("hasRole('NURSE')")
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

    @Operation(summary = "Phản hồi của phụ huynh", description = "lấy từ id của NotificationRecipients")
    @PutMapping("/respond/{id}/{parentID}")
    public ResponseEntity<Notification2ReceiveResponse> respondToNotification(@PathVariable("id") Long id ,@PathVariable("parentID") Long parentID,@RequestBody ResponseStatus status) {

        return ResponseEntity.ok(notification2Service.respondToNotification(id, parentID, status));
    }

    @GetMapping("/notifications/{id}/responses")
    public ResponseEntity<Notification2ResponseStatusDTO> getNotificationResponseStatus(@PathVariable Long id) {
        Notification2ResponseStatusDTO dto = notification2Service.getNotificationResponses(id);
        return ResponseEntity.ok(dto);
    }

    // Nurse
    @Operation(summary = "Lấy tất cả thông báo", description = "Lấy danh sách tất cả thông báo đã gửi đến phụ huynh")
    @GetMapping("/nurse/getAllNotification")
    public ResponseEntity<?> findAllNotification() {
        return ResponseEntity.ok(notification2Service.findAllNotification());
    }

    @Operation(summary = "Lấy thông báo theo type", description = "Lấy thông báo theo type")
    @GetMapping("/nurse/getNotificationsByType/{type}")
    public ResponseEntity<?> getNotificationsByType(@PathVariable("type") NotificationType type) {
        try {

            return ResponseEntity.ok(notification2Service.getNotificationsByType(type));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid notification type: " + type);
        }
    }

    @Operation(summary = "Lấy thông báo theo ID", description = "Lấy thông báo theo ID")
    @GetMapping("/nurse/getNotificationById/{id}")
    public ResponseEntity<Notification2ResponseDTO> findNotificationById(@PathVariable Long id) {

        return ResponseEntity.ok(notification2Service.findNotificationById(id));
    }


    @Operation(summary = "First, phụ huynh xem lại những thông bao vaccine", description = "xem lại những thông báo vaccine đã được chấp nhận")
    @GetMapping("/getAcceptedNotificationsByParent/{parentId}/{studentId}")
    public ResponseEntity<?> getAcceptedNotificationsByParent(@PathVariable("parentId") Long parentId , @PathVariable("studentId") String studentId) {
        return ResponseEntity.ok(notification2Service.getAcceptedNotificationsByParent(parentId, studentId));
    }


    @GetMapping("/getVacineByStudentIdAndNotiID/{studentId}/{id}")
    public ResponseEntity<?> getVacineByStudentIdAndNotiID(@PathVariable("studentId") String studentId, @PathVariable("id") Long id) {
        return ResponseEntity.ok(notification2Service.getVacineByStudentIdAndNotiID(studentId, id));
    }
}



