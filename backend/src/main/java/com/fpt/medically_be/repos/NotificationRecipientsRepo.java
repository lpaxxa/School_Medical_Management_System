package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.NotificationRecipients;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface NotificationRecipientsRepo extends JpaRepository<NotificationRecipients, Long> {

    List<NotificationRecipients> findByNotificationId(Long notificationId);

    List<NotificationRecipients> findByReceiverId(Long receiverId);

    NotificationRecipients findByNotificationIdAndReceiverId(Long notificationId, Long receiverId);
}
