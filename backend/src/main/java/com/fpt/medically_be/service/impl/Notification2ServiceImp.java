package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.request.Notification2UpdateDTO;
import com.fpt.medically_be.dto.request.StudentReceiverRequest;
import com.fpt.medically_be.dto.response.*;

import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.mapper.Notification2Mapper;
import com.fpt.medically_be.mapper.Notification2TitleMapper;
import com.fpt.medically_be.mapper.NotificationRecipientMapper;
import com.fpt.medically_be.repos.*;
import com.fpt.medically_be.service.Notification2Service;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    NotificationRecipientMapper notificationRecipientMapper;
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private NurseRepository nurseRepository;
    @Autowired
    private ParentRepository parentRepository; // Assuming you have a ParentRepository

    @Autowired
    private NotificationRecipientsRepo notificationRecipientsRepo;

    // FIX PARENT ID SAI VẪN GƯI ĐƯỢC, CLASS Y CHANG
    @Transactional
    @Override
    public Notification2ResponseDTO createNotification(Notification2RequestDTO dto) {

        Notification2 noti = notification2Mapper.toNotificationEntity(dto);

        Nurse nurse = nurseRepository.findById(dto.getSenderId()).orElseThrow(()
                -> new RuntimeException("Nurse not found with id: " + dto.getSenderId()));

        noti.setCreatedBy(nurse);
        notification2Repository.save(noti);

        Set<String> studentIdSet = new HashSet<>();
        List<NotificationRecipients> recipients = new ArrayList<>();

        // Gửi theo lớp (gửi theo từng học sinh)
        if (dto.getClassIds() != null && !dto.getClassIds().isEmpty()) {
            List<Student> studentsByClass = studentRepository.findByClassNameIn(dto.getClassIds());

            if(studentsByClass.isEmpty()) {
                throw new RuntimeException("No students or class name found for the given class IDs");
            }

            for (Student student : studentsByClass) {

                if (student.getParent() != null) {
                    studentIdSet.add(student.getStudentId());
                }
            }
        }

        // Gửi theo parent cụ thể (gửi 1 lần mỗi parent, KHÔNG gửi theo học sinh)
        if (dto.getReceiverIds() != null && !dto.getReceiverIds().isEmpty()) {
            List<Parent> parents = parentRepository.findByIdIn(dto.getReceiverIds());

            if (parents.isEmpty()) {
                throw new RuntimeException("No parents found for the given receiver IDs");
            }

            for (Parent parent : parents) {
                List<Student> students = studentRepository.findByParentId(parent.getId());
                NotificationRecipients nr = new NotificationRecipients();
                Student student = students.isEmpty() ? null : students.get(0);
                nr.setNotification(noti);
                nr.setReceiver(parent);
                nr.setResponse(ResponseStatus.PENDING);
                nr.setStudent(student);
                recipients.add(nr);
            }
        }

        // Xử lý các học sinh từ phần gửi theo lớp
        if (!studentIdSet.isEmpty()) {
            List<Student> allStudents = studentRepository.findByStudentIdIn(new ArrayList<>(studentIdSet));
            for (Student student : allStudents) {
                Parent parent = student.getParent();
                if (parent != null) {
                    NotificationRecipients nr = new NotificationRecipients();
                    nr.setNotification(noti);
                    nr.setReceiver(parent);
                    nr.setStudent(student);
                    nr.setResponse(ResponseStatus.PENDING);
                    recipients.add(nr);
                }
            }
        }

        notificationRecipientsRepo.saveAll(recipients);
        noti.setNotificationRecipients(recipients);
        return notification2Mapper.toNotificationResponseDTO(noti);
    }





//    @Transactional
//    @Override
//    public Notification2ResponseDTO createNotification(Notification2RequestDTO notification2) {
//
//        Notification2 noti = notification2Mapper.toNotificationEntity(notification2);
//
//        Nurse nurse = nurseRepository.findById(notification2.getSenderId()).orElseThrow(()
//                -> new RuntimeException("Nurse not found with id: " + notification2.getSenderId()));
//
//        noti.setCreatedBy(nurse);
//        notification2Repository.save(noti);
//
//        List<NotificationRecipients> recipients = notification2.getStudentReceivers().stream()
//                .flatMap(receiverDto -> {
//                    Parent parent = parentRepository.findById(receiverDto.getParentId())
//                            .orElseThrow(() -> new RuntimeException("Parent not found with id: " + receiverDto.getParentId()));
//
//                    List<Student> students = studentRepository.findByStudentIdIn(receiverDto.getStudentIds());
//
//                    return students.stream().map(student -> {
//                        NotificationRecipients r = new NotificationRecipients();
//                        r.setNotification(noti);
//                        r.setReceiver(parent);
//                        r.setStudent(student);  // mỗi học sinh tạo 1 bản ghi
//                        r.setResponse(ResponseStatus.PENDING);
//                        return r;
//                    });
//                })
//                .collect(Collectors.toList());
//
//        notificationRecipientsRepo.saveAll(recipients);
//        noti.setNotificationRecipients(recipients);
//        return notification2Mapper.toNotificationResponseDTO(noti);
//    }

    @Override
    public List<Notification2TitleResponse> getNotificationTitlesByParentId(Long parentId) {

        List<NotificationRecipients> recipients = notificationRecipientsRepo.findByReceiverId(parentId);

        return recipients.stream()
                .map(notification2TitleMapper::toNotificationTitleResponse)
                .collect(Collectors.toList());


    }

    @Override
    public List<ParentNotificationResponseDTO> getNotificationsByParentId(Long parentId) {
        List<NotificationRecipients> recipients = notificationRecipientsRepo.findByReceiverId(parentId);

        if (recipients.isEmpty()) {
            throw new RuntimeException("No notifications found for the given parent ID");
        }

        return recipients.stream()
                .map(notification2Mapper::toParentNotificationResponseDTO)
                .collect(Collectors.toList());

    }

    @Transactional
    @Override
    public Notification2ReceiveResponse respondToNotification(Long notiId, Long parentId, ResponseStatus status) {

        NotificationRecipients recipients = notificationRecipientsRepo.findByIdAndReceiverId(notiId, parentId);
        if (recipients == null) {
            throw new RuntimeException("Notification recipient not found for the given notification ID and parent ID");
        }
        if (recipients.getResponse() != ResponseStatus.PENDING) {
            throw new RuntimeException("Notification already responded");
        }
        recipients.setResponse(status);
        recipients.setResponseAt(LocalDateTime.now());
        notificationRecipientsRepo.save(recipients);

        return notification2Mapper.toNotificationReceiveResponse(recipients);
    }


//    @Transactional
//    @Override
//    public Notification2ReceiveResponse respondToNotification(Notification2UpdateDTO request) {
//        NotificationRecipients noti = notificationRecipientsRepo.findById(request.getNotificationRecipientId())
//                .orElseThrow(() -> new RuntimeException("Notification recipient not found"));
//
//
//        if (noti.getResponse() != ResponseStatus.PENDING) {
//            throw new RuntimeException("Notification already responded");
//        }
//
//        com.fpt.medically_be.entity.ResponseStatus responseStatus = ResponseStatus.valueOf(request.getResponse().toUpperCase());
//
//        noti.setResponse(responseStatus);
//        noti.setResponseAt(LocalDateTime.now());
//        return notification2Mapper.toNotificationReceiveResponse(noti);
//
//    }

    @Override
    public Notification2ReceiveResponse getNotificationDetail(Long notiId, Long parentId) {

        NotificationRecipients recipient = notificationRecipientsRepo
                .findByIdAndReceiverId(notiId, parentId);

        if (recipient == null) {
            throw new RuntimeException("Notification not found for the given ID and parent ID");
        }

        Notification2 n = new Notification2();
        Notification2ReceiveResponse noti = notification2Mapper.toNotificationReceiveResponse(recipient);
        return noti;
    }



    @Override
    public Notification2ResponseStatusDTO getNotificationResponses(Long notificationId) {
        Notification2 notification = notification2Repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        List<NotificationRecipients> recipients = notificationRecipientsRepo.findByNotification(notification);

        List<ParentDTO2> approved = new ArrayList<>();
        List<ParentDTO2> pending = new ArrayList<>();
        List<ParentDTO2> rejected = new ArrayList<>();

        for (NotificationRecipients r : recipients) {
            Parent parent = r.getReceiver();
            ParentDTO2 parentDTO = new ParentDTO2(parent.getId(), parent.getFullName(), parent.getEmail());

            ResponseStatus response = r.getResponse();
            if (response == null || response == ResponseStatus.PENDING) {
                pending.add(parentDTO);
            } else if (response == ResponseStatus.ACCEPTED) {
                approved.add(parentDTO);
            } else if (response == ResponseStatus.REJECTED) {
                rejected.add(parentDTO);
            }
        }

        return new Notification2ResponseStatusDTO(approved, pending, rejected);
    }

    //Nurse

    @Override
    public List<Notification2ResponseDTO> findAllNotification() {
    List<Notification2> notifications = notification2Repository.findAll();
        return notification2Repository.findAll().stream().map(
                notification2Mapper::toNotificationResponseDTO
        ).collect(Collectors.toList());

    }

    @Override
    public Notification2ResponseDTO findNotificationById(Long notificationId) {
        Notification2 notification2 = notification2Repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return notification2Mapper.toNotificationResponseDTO(notification2);
    }

    @Override
    public List<Notification2ResponseDTO> getNotificationsByType(NotificationType type) {

        List<Notification2> notifications = notification2Repository.findByType(type);
        if (notifications.isEmpty()) {
            throw new RuntimeException("No notifications found for the given type");
        }
        return notifications.stream()
                .map(notification2Mapper::toNotificationResponseDTO)
                .collect(Collectors.toList());
    }

//    @Override
//    public List<VaccineApproveNotiResponse> getAcceptedNotificationsByParent(Long parentId) {
//        List<NotificationRecipients> recipients = notificationRecipientsRepo
//                .findByResponseAndReceiverIdAndNotification_Type(ResponseStatus.ACCEPTED, parentId, NotificationType.VACCINATION);
//
//
//        return recipients.stream()
//                .map(notification2Mapper::toNotificationResponseDTO)
//                .collect(Collectors.toList());
//    }
@Override
public List<VaccineApproveNotiResponse> getAcceptedNotificationsByParent(Long parentId, String studentId) {
    List<NotificationRecipients> recipients = notificationRecipientsRepo
            .findByReceiverIdAndStudent_StudentIdAndResponseAndNotification_Type(parentId,studentId, ResponseStatus.ACCEPTED, NotificationType.VACCINATION);


    return recipients.stream()
            .map(notification2Mapper::toNotificationResponseDTO)
            .collect(Collectors.toList());
}

    @Override
    public VaccineInforRequest getVacineByStudentIdAndNotiID(String studendId, Long id) {

        NotificationRecipients recipient = notificationRecipientsRepo.findByIdAndStudent_StudentId(id, studendId);

        if (recipient == null) {
            throw new RuntimeException("Notification recipient not found for the given ID and student ID");
        }

        return notification2Mapper.toVaccineInforRequest(recipient);
    }

    @Override
    public List<NotificationAccepted> getNotificationAcceptedByIdAndResponse(Long id, ResponseStatus studentId) {

        List<NotificationRecipients> recipient = notificationRecipientsRepo.findByNotification_IdAndResponse(id, studentId);
        if (recipient.isEmpty()) {
            throw new RuntimeException("No recipients found with notificationId = " + id + " and responseStatus = " + studentId);
        }

        return recipient.stream()
                .map(notificationRecipientMapper::toNotificationAccepted)
                .collect(Collectors.toList());
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
