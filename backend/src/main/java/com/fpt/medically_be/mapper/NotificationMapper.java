package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.request.NotificationRequestDTO;
import com.fpt.medically_be.dto.response.NotificationResponseDTO;
import com.fpt.medically_be.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    Notification toNotificationEntity(NotificationRequestDTO notificationRequestDTO);

    NotificationResponseDTO toNotificationResponseDTO(Notification notification);
}
