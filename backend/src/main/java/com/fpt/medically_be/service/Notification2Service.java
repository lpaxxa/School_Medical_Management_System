package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.request.Notification2UpdateDTO;
import com.fpt.medically_be.dto.response.Notification2ReceiveResponse;
import com.fpt.medically_be.dto.response.Notification2ResponseDTO;
import com.fpt.medically_be.dto.response.Notification2TitleResponse;

import java.util.List;

public interface Notification2Service {

    Notification2ResponseDTO createNotification(Notification2RequestDTO notification);

    List<Notification2TitleResponse> getNotificationTitlesByParentId(Long parentId);


    List<Notification2ResponseDTO> getNotificationsByParentId(Long parentId);

    Notification2ReceiveResponse respondToNotification(Notification2UpdateDTO request);


    Notification2ReceiveResponse getNotificationDetail(Long notiId, Long parentId);

}
