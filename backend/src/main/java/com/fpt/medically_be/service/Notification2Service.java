package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.request.Notification2RequestDTO;
import com.fpt.medically_be.dto.request.Notification2UpdateDTO;
import com.fpt.medically_be.dto.response.*;
import com.fpt.medically_be.entity.Notification2;
import com.fpt.medically_be.entity.NotificationType;
import com.fpt.medically_be.entity.ResponseStatus;
import com.fpt.medically_be.entity.Status;

import java.util.List;

public interface Notification2Service {

    Notification2ResponseDTO createNotification(Notification2RequestDTO notification);

    List<Notification2TitleResponse> getNotificationTitlesByParentId(Long parentId);


    List<ParentNotificationResponseDTO> getNotificationsByParentId(Long parentId);

    Notification2ReceiveResponse respondToNotification(Long notiId, Long parentId, ResponseStatus status);


    Notification2ReceiveResponse getNotificationDetail(Long notiId, Long parentId);

    // nurse
    Notification2ResponseStatusDTO getNotificationResponses(Long notificationId);

    List<Notification2ResponseDTO> findAllNotification();

    Notification2ResponseDTO findNotificationById(Long notificationId);

    List<Notification2ResponseDTO> getNotificationsByType(NotificationType type);

//   lấy ra những thông báo mà phụ huynh đã accept
    List<VaccineApproveNotiResponse> getAcceptedNotificationsByParent(Long parentId, String studentId);

    //dành cho khi bấm vào ghi nhận tiêm, thì sẽ hiển thị được nhiều thông tin
    VaccineInforRequest getVacineByStudentIdAndNotiID(String studendId, Long id);

    // xem danh sach de tiem
    List<NotificationAccepted> getNotificationAcceptedByIdAndResponse(Long id, ResponseStatus studentId);
}
