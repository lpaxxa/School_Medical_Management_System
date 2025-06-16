package com.fpt.medically_be.service;


import com.fpt.medically_be.dto.request.NotificationRequestDTO;
import com.fpt.medically_be.dto.response.NotificationResponseDTO;
import com.fpt.medically_be.dto.response.NotificationTitleResponse;
import com.fpt.medically_be.dto.response.NotificationUpdateDTO;

import java.util.List;


public interface NotificationService {


     void createNotification(NotificationRequestDTO notification);

     List<NotificationTitleResponse> getNotificationTitlesByParentId(Long parentId);


     List<NotificationResponseDTO> getNotificationsByParentId(Long parentId);

     void respondToNotification(NotificationUpdateDTO request);


     NotificationResponseDTO getNotificationDetail(Long notiId, Long parentId);

}
