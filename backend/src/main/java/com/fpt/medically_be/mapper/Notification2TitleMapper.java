package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.response.Notification2TitleResponse;
import com.fpt.medically_be.entity.Notification2;
import com.fpt.medically_be.entity.NotificationRecipients;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface Notification2TitleMapper {


    @Mapping(source = "notification.title", target = "title")
    @Mapping(source = "notification.createdAt", target = "receivedDate")
    Notification2TitleResponse toNotificationTitleResponse(NotificationRecipients notificationRecipients);
}
