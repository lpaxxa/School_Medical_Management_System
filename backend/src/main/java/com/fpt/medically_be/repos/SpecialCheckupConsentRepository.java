package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.SpecialCheckupConsent;
import com.fpt.medically_be.entity.NotificationRecipients;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecialCheckupConsentRepository extends JpaRepository<SpecialCheckupConsent, Long> {

    List<SpecialCheckupConsent> findByNotificationRecipient(NotificationRecipients notificationRecipient);

    List<SpecialCheckupConsent> findByNotificationRecipientId(Long notificationRecipientId);
}
