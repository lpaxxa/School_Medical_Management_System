package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.response.*;
import com.fpt.medically_be.entity.Notification2;
import com.fpt.medically_be.entity.NotificationRecipients;
import com.fpt.medically_be.entity.Parent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

import java.util.List;

@Mapper(componentModel = "spring")
public interface Notification2Mapper {


    Notification2 toNotificationEntity(Notification2RequestDTO notification2RequestDTO);



    @Mapping(source = "createdBy.fullName",     target = "senderName")
    @Mapping(source = "notificationRecipients", target = "recipients")
    Notification2ResponseDTO toNotificationResponseDTO(Notification2 notification2);


    // get parent notification by Id
    @Mapping(source = "notification.title", target = "title")
    @Mapping(source = "notification.message", target = "message")
    @Mapping(source = "notification.createdAt", target = "createdAt")
    @Mapping(source = "notification.createdBy.fullName", target = "senderName")
    @Mapping(source = "notification.type", target = "type")
    @Mapping(source = "student.studentId", target = "studentId")
    @Mapping(source = "student.fullName", target = "studentName")
    ParentNotificationResponseDTO toParentNotificationResponseDTO(NotificationRecipients notificationRecipients);


    @Mapping(source = "receiver.fullName",  target = "receiverName")  // Chỉ một lần!
    @Mapping(source = "student.studentId",  target = "studentId")
    @Mapping(source = "student.fullName",   target = "studentName")
    @Mapping(source = "response",           target = "response")
    NotificationRecipientsDTO toNotificationRecipientsDTO(NotificationRecipients nr);


    @Mapping(source = "id", target = "id")
    @Mapping(source = "notification.title", target = "title")
    @Mapping(source = "notification.message", target = "message")
    @Mapping(source = "notification.isRequest", target = "isRequest")
    @Mapping(source = "notification.createdBy.fullName", target = "senderName")
    @Mapping(source = "notification.createdAt", target = "createdAt")
    @Mapping(source = "responseAt", target = "responseAt")
    Notification2ReceiveResponse toNotificationReceiveResponse(NotificationRecipients notification2);

    //Notification2ResponseDTO toNotificationResponseDTO(NotificationRecipients notificationRecipients);
    @Mapping(source = "notification.title", target = "title")
    @Mapping(source = "notification.message", target = "message")
    @Mapping(source = "notification.createdAt", target = "receivedAt")
    @Mapping(source = "student.id", target = "studentId")
    @Mapping(source = "student.fullName", target = "studentName")
    VaccineApproveNotiResponse toNotificationResponseDTO(NotificationRecipients notificationRecipients);


    // dành cho việc lấy ra những thông báo mà phụ huynh đã accept
    @Mapping(source = "id", target = "notificationRecipientID")
    @Mapping(source = "notification.createdBy.id", target = "nurseID")
    @Mapping(source = "student.healthProfile.id", target = "healthProfileID")
    @Mapping(source = "student.studentId", target = "studentID")
    @Mapping(source = "student.imageUrl", target = "imageUrl")
    @Mapping(source = "student.gender", target = "gender")
    @Mapping(source = "student.className", target = "className")
    @Mapping(source = "student.fullName", target = "studentName")
    VaccineInforRequest toVaccineInforRequest(NotificationRecipients notificationRecipients);

}
