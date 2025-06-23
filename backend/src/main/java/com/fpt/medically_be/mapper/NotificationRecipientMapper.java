package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.response.NotificationAccepted;
import com.fpt.medically_be.entity.NotificationRecipients;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationRecipientMapper {

    @Mapping(source = "receiver.fullName", target = "receiverName")
    @Mapping(source = "student.studentId", target = "studentId")
    @Mapping(source = "student.fullName", target = "studentName")
    NotificationAccepted toNotificationAccepted(NotificationRecipients notificationRecipients);
}
