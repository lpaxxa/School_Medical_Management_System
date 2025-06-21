package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.request.Notification2UpdateDTO;
import com.fpt.medically_be.dto.response.*;
import com.fpt.medically_be.entity.Notification2;
import com.fpt.medically_be.entity.NotificationType;
import com.fpt.medically_be.entity.ResponseStatus;

import java.util.List;

public interface Notification2Service {

    Notification2ResponseDTO createNotification(Notification2RequestDTO notification);

    List<Notification2TitleResponse> getNotificationTitlesByParentId(Long parentId);


    List<Notification2ResponseDTO> getNotificationsByParentId(Long parentId);

    Notification2ReceiveResponse respondToNotification(Long notiId, Long parentId, ResponseStatus status);


    Notification2ReceiveResponse getNotificationDetail(Long notiId, Long parentId);

    // nurse
    Notification2ResponseStatusDTO getNotificationResponses(Long notificationId);

    List<Notification2ResponseDTO> findAllNotification();

    Notification2ResponseDTO findNotificationById(Long notificationId);

    List<Notification2ResponseDTO> getNotificationsByType(NotificationType type);

    List<VaccineApproveNotiResponse>  getAcceptedNotificationsByParent(Long parentId);
}
