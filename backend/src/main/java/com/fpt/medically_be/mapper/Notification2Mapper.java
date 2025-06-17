package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.response.Notification2ReceiveResponse;
import com.fpt.medically_be.dto.response.Notification2ResponseDTO;
import com.fpt.medically_be.dto.response.NotificationRecipientsDTO;
import com.fpt.medically_be.entity.Notification2;
import com.fpt.medically_be.entity.NotificationRecipients;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

import java.util.List;

@Mapper(componentModel = "spring")
public interface Notification2Mapper {


    Notification2 toNotificationEntity(Notification2RequestDTO notification2RequestDTO);



    @Mapping(source = "createdBy.fullName", target = "senderName")
    @Mapping(source = "notificationRecipients", target = "recipients")
    Notification2ResponseDTO toNotificationResponseDTO(Notification2 notification2);

    @Mapping(source = "receiver.fullName", target = "receiverName")
    @Mapping(source = "response", target = "response")
    NotificationRecipientsDTO toNotificationRecipientsDTO(NotificationRecipients entity);

    @Mapping(source = "notification.title", target = "title")
    @Mapping(source = "notification.message", target = "message")
    @Mapping(source = "notification.isRequest", target = "isRequest")
    @Mapping(source = "notification.createdBy.fullName", target = "senderName")
    @Mapping(source = "notification.createdAt", target = "createdAt")
    @Mapping(source = "responseAt", target = "responseAt")
    Notification2ReceiveResponse toNotificationReceiveResponse(NotificationRecipients notification2);
}
