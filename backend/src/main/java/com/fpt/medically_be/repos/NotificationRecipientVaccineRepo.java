package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.NotificationRecipientVaccine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRecipientVaccineRepo extends JpaRepository<NotificationRecipientVaccine,Long> {

}
