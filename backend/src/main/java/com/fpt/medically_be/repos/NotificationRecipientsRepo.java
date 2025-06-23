package com.fpt.medically_be.repos;

import com.fpt.medically_be.dto.response.VaccineInforRequest;
import com.fpt.medically_be.entity.Notification2;
import com.fpt.medically_be.entity.NotificationRecipients;
import com.fpt.medically_be.entity.NotificationType;
import com.fpt.medically_be.entity.ResponseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface NotificationRecipientsRepo extends JpaRepository<NotificationRecipients, Long> {

    List<NotificationRecipients> findByNotificationId(Long notificationId);

    List<NotificationRecipients> findByReceiverId(Long receiverId);

    NotificationRecipients findByIdAndReceiverId(Long id, Long receiverId);

    List<NotificationRecipients> findByNotification(Notification2 notification);

  // List<NotificationRecipients> findByResponseAndReceiverIdAndNotification_Type(ResponseStatus response, Long receiverId, NotificationType notificationType);

    List<NotificationRecipients> findByReceiverIdAndStudent_StudentIdAndResponseAndNotification_Type(
            Long receiverId,
            String studentId,
            ResponseStatus response,
            NotificationType notificationType
    );

    NotificationRecipients findByIdAndStudent_StudentId(Long id, String studentStudentId);

    List<NotificationRecipients> findByNotification_IdAndResponse(Long notificationId, ResponseStatus response);
}
