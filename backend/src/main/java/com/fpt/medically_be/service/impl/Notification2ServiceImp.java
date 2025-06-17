package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.request.Notification2UpdateDTO;
import com.fpt.medically_be.dto.response.Notification2ReceiveResponse;
import com.fpt.medically_be.dto.response.Notification2ResponseDTO;
import com.fpt.medically_be.dto.response.Notification2TitleResponse;

import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.mapper.Notification2Mapper;
import com.fpt.medically_be.mapper.Notification2TitleMapper;
import com.fpt.medically_be.repos.NotificationRecipientsRepo;
import com.fpt.medically_be.repos.Notification2Repository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.ParentRepository;
import com.fpt.medically_be.service.Notification2Service;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class Notification2ServiceImp implements Notification2Service {

    @Autowired
    private Notification2Repository notification2Repository;
    @Autowired
    private Notification2Mapper notification2Mapper;
    @Autowired
    private Notification2TitleMapper notification2TitleMapper;

    @Autowired
    private NurseRepository nurseRepository;
    @Autowired
    private ParentRepository parentRepository; // Assuming you have a ParentRepository

    @Autowired
    private NotificationRecipientsRepo notificationRecipientsRepo;

    @Transactional
    @Override
    public Notification2ResponseDTO createNotification(Notification2RequestDTO notification2) {

        Notification2 noti = notification2Mapper.toNotificationEntity(notification2);

        Nurse nurse = nurseRepository.findById(notification2.getSenderId()).orElseThrow(()
                -> new RuntimeException("Nurse not found with id: " + notification2.getSenderId()));

        noti.setCreatedBy(nurse);
        notification2Repository.save(noti);

        List<NotificationRecipients> recipients = notification2.getReceiverIds().stream().map(id -> {
            Parent parent = parentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Parent not found"));

            NotificationRecipients r = new NotificationRecipients();
            r.setNotification(noti);
            r.setReceiver(parent);
            r.setResponse(ResponseStatus.PENDING);
            return r;
        }).collect(Collectors.toList());
        notificationRecipientsRepo.saveAll(recipients);

        noti.setNotificationRecipients(recipients);

        return notification2Mapper.toNotificationResponseDTO(noti);
    }

    @Override
    public List<Notification2TitleResponse> getNotificationTitlesByParentId(Long parentId) {

        List<NotificationRecipients> recipients = notificationRecipientsRepo.findByReceiverId(parentId);

        return recipients.stream()
                .map(r -> {
                    Notification2 n = r.getNotification();

                    Notification2TitleResponse noti = notification2TitleMapper.toNotificationTitleResponse(n);
                    return noti;
                }).collect(Collectors.toList());


    }

    @Override
    public List<Notification2ResponseDTO> getNotificationsByParentId(Long parentId) {
        List<NotificationRecipients> recipients = notificationRecipientsRepo.findByReceiverId(parentId);

        if (recipients.isEmpty()) {
            throw new RuntimeException("No notifications found for the given parent ID");
        }

        return recipients.stream().map(item -> {
            Notification2 n = item.getNotification();
            Notification2ResponseDTO dto = notification2Mapper.toNotificationResponseDTO(n);


            // Gửi từ nurse nào
            if (n.getCreatedBy() != null) {
                dto.setSenderName(n.getCreatedBy().getFullName());
            } else {
                dto.setSenderName("Unknown");
            }

            // Phản hồi của parent
//            dto.setResponse(item.getResponse()!= null ? item.getResponse().name().toLowerCase(): null);
//            dto.setResponse(item.getResponse().name());
//            dto.setResponseAt(item.getResponseAt());

            return dto;
        }).collect(Collectors.toList());

    }


    @Transactional
    @Override
    public Notification2ReceiveResponse respondToNotification(Notification2UpdateDTO request) {
        NotificationRecipients noti = notificationRecipientsRepo.findById(request.getNotificationRecipientId())
                .orElseThrow(() -> new RuntimeException("Notification recipient not found"));


        if (noti.getResponse() != ResponseStatus.PENDING) {
            throw new RuntimeException("Notification already responded");
        }

        com.fpt.medically_be.entity.ResponseStatus responseStatus = ResponseStatus.valueOf(request.getResponse().toUpperCase());

        noti.setResponse(responseStatus);
        noti.setResponseAt(LocalDateTime.now());
        return notification2Mapper.toNotificationReceiveResponse(noti);

    }

    @Override
    public Notification2ReceiveResponse getNotificationDetail(Long notiId, Long parentId) {

        NotificationRecipients recipient = notificationRecipientsRepo
                .findByNotificationIdAndReceiverId(notiId, parentId);

        if (recipient == null) {
            throw new RuntimeException("Notification not found for the given ID and parent ID");
        }

        Notification2 n = new Notification2();
        Notification2ReceiveResponse noti = notification2Mapper.toNotificationReceiveResponse(recipient);
        return noti;
    }


//        @Override
//        public List<Notification2ResponseDTO> getNotificationsByParentId(Long parentId) {
//            List<NotificationRecipients> recipients = notificationRecipientsRepo.findByNotificationId(parentId);
//
//            if (recipients.isEmpty()) {
//                throw new RuntimeException("No notifications found for the given parent ID");
//            }
//
//            return recipients.stream().map(item -> {
//                Notification n = item.getNotification();
//                Notification2ResponseDTO dto = notificationMapper.toNotificationResponseDTO(n);
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
