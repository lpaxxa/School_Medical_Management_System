package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.response.Notification2ResponseDTO;
import com.fpt.medically_be.entity.Notification2;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface Notification2Mapper {

Notification2 toNotificationEntity(Notification2RequestDTO notification2RequestDTO);

Notification2ResponseDTO toNotificationResponseDTO(Notification2 notification2);

}
