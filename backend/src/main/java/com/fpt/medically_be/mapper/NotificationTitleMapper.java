package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.response.NotificationTitleResponse;
import com.fpt.medically_be.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationTitleMapper {

    NotificationTitleResponse toNotificationTitleResponse(Notification notification);
}
