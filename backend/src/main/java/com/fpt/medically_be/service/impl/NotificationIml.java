package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.NotificationRequestDTO;
import com.fpt.medically_be.dto.response.NotificationResponseDTO;
import com.fpt.medically_be.dto.response.NotificationTitleResponse;
import com.fpt.medically_be.dto.response.NotificationUpdateDTO;
import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.mapper.NotificationMapper;
import com.fpt.medically_be.mapper.NotificationTitleMapper;
import com.fpt.medically_be.repos.NotificationRecipientsRepo;
import com.fpt.medically_be.repos.NotificationRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.ParentRepository;
import com.fpt.medically_be.service.NotificationService;
import com.fpt.medically_be.service.ParentService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationIml implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private NotificationMapper notificationMapper;
    @Autowired
    private NotificationTitleMapper notificationTitleMapper;

    @Autowired
    private NurseRepository nurseRepository;
    @Autowired
    private ParentRepository parentRepository; // Assuming you have a ParentRepository

    @Autowired
    private NotificationRecipientsRepo notificationRecipientsRepo;

    @Transactional
    @Override
    public void createNotification(NotificationRequestDTO notification) {

        Notification noti = notificationMapper.toNotificationEntity(notification);

        Nurse nurse = nurseRepository.findById(notification.getSenderId()).orElseThrow(()
                -> new RuntimeException("Nurse not found with id: " + notification.getSenderId()));

         noti.setCreatedBy(nurse);
        notificationRepository.save(noti);

        List<NotificationRecipients> recipients = notification.getReceiverIds().stream().map(id -> {
            Parent parent = parentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Parent not found"));
            NotificationRecipients r = new NotificationRecipients();
            r.setNotification(noti);
            r.setReceiver(parent);
            r.setResponse(ResponseStatus.PENDING);
            return r;
        }).collect(Collectors.toList());


        notificationRecipientsRepo.saveAll(recipients);
    }

    @Override
    public List<NotificationTitleResponse> getNotificationTitlesByParentId(Long parentId) {

        List<NotificationRecipients> recipients = notificationRecipientsRepo.findByReceiverId(parentId);

        return recipients.stream()
                .map(r -> {
                    Notification n = r.getNotification();

                    NotificationTitleResponse noti = notificationTitleMapper.toNotificationTitleResponse(n);
                   return noti;
                }).collect(Collectors.toList());


    }

    @Override
    public List<NotificationResponseDTO> getNotificationsByParentId(Long parentId) {
        List<NotificationRecipients> recipients = notificationRecipientsRepo.findByReceiverId(parentId);

        if (recipients.isEmpty()) {
            throw new RuntimeException("No notifications found for the given parent ID");
        }

        return recipients.stream().map(item -> {
            Notification n = item.getNotification();
            NotificationResponseDTO dto = notificationMapper.toNotificationResponseDTO(n);


            // Gửi từ nurse nào
            if (n.getCreatedBy() != null) {
                dto.setSenderName(n.getCreatedBy().getFullName());
            } else {
                dto.setSenderName("Unknown");
            }

            // Phản hồi của parent
//            dto.setResponse(item.getResponse()!= null ? item.getResponse().name().toLowerCase(): null);
            dto.setResponse(item.getResponse().name());
            dto.setResponseAt(item.getResponseAt());

            return dto;
        }).collect(Collectors.toList());

    }


    @Transactional
    @Override
    public void respondToNotification(NotificationUpdateDTO request) {
        NotificationRecipients noti = notificationRecipientsRepo.findById(request.getNotificationRecipientId())
                .orElseThrow(() -> new RuntimeException("Notification recipient not found"));


        if (noti.getResponse() != ResponseStatus.PENDING) {
            throw new RuntimeException("Notification already responded");
        }

        ResponseStatus responseStatus = ResponseStatus.valueOf(request.getResponse().toUpperCase());

        noti.setResponse(responseStatus);


    }

    @Override
    public NotificationResponseDTO getNotificationDetail(Long notiId, Long parentId) {

        NotificationRecipients recipient = notificationRecipientsRepo
                .findByNotificationIdAndReceiverId(notiId, parentId);

        if (recipient == null) {
            throw new RuntimeException("Notification not found for the given ID and parent ID");
        }

        Notification n = new Notification();
        NotificationResponseDTO noti = notificationMapper.toNotificationResponseDTO(n);
        return noti;
    }


//        @Override
//        public List<NotificationResponseDTO> getNotificationsByParentId(Long parentId) {
//            List<NotificationRecipients> recipients = notificationRecipientsRepo.findByNotificationId(parentId);
//
//            if (recipients.isEmpty()) {
//                throw new RuntimeException("No notifications found for the given parent ID");
//            }
//
//            return recipients.stream().map(item -> {
//                Notification n = item.getNotification();
//                NotificationResponseDTO dto = notificationMapper.toNotificationResponseDTO(n);
//
//
//                // Gửi từ nurse nào
//                if (n.getCreatedBy() != null) {
//                    dto.setSenderName(n.getCreatedBy().getFullName());
//                } else {
//                    dto.setSenderName("Unknown");
//                }
//
//                // Phản hồi của parent
//                dto.setResponse(item.getReceiver()!= null ? item.getReceiver().getFullName() : null);
//                dto.setResponseAt(item.getResponseAt());
//
//                return dto;
//            }).collect(Collectors.toList());
//
//        }

}
