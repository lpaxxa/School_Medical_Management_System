package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.Notification2;
import com.fpt.medically_be.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Notification2Repository extends JpaRepository<Notification2, Long> {


    List<Notification2> findByType(NotificationType type);

}
