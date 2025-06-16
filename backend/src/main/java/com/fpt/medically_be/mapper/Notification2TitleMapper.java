package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.response.Notification2TitleResponse;
import com.fpt.medically_be.entity.Notification2;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface Notification2TitleMapper {

    Notification2TitleResponse toNotificationTitleResponse(Notification2 notification2);
}
