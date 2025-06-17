package com.fpt.medically_be.controller;


import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.request.Notification2UpdateDTO;
import com.fpt.medically_be.dto.response.Notification2ReceiveResponse;
import com.fpt.medically_be.dto.response.Notification2ResponseDTO;
import com.fpt.medically_be.service.Notification2Service;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")

public class NotificationController {

    @Autowired
    public Notification2Service notification2Service;

    @PostMapping("/create")
    public ResponseEntity<Notification2ResponseDTO> createNotification(@Valid @RequestBody Notification2RequestDTO notification2RequestDTO) {


        return ResponseEntity.ok(notification2Service.createNotification(notification2RequestDTO));
        }

    @GetMapping("/getTitlesByParentId/{parentId}")
    public ResponseEntity<?> getNotificationTitlesByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(notification2Service.getNotificationTitlesByParentId(parentId));
    }

    @GetMapping("/getDetail/{notiId}/{parentId}")
    public ResponseEntity<?> getNotificationDetail(@PathVariable Long notiId, @PathVariable Long parentId) {
        return ResponseEntity.ok(notification2Service.getNotificationDetail(notiId, parentId));
    }


        @GetMapping("/getByParentId/{parentId}")
        public ResponseEntity<?> getNotificationsByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(notification2Service.getNotificationsByParentId(parentId));
        }


    @PutMapping("/notifications/respond")
    public ResponseEntity<Notification2ReceiveResponse> respondToNotification(@RequestBody Notification2UpdateDTO request) {


        return ResponseEntity.ok(notification2Service.respondToNotification(request));
    }



        }



