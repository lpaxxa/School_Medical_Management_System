package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.ConfirmVaccinesRequest;
import com.fpt.medically_be.dto.request.VaccineConfirmation;
import com.fpt.medically_be.entity.NotificationRecipientVaccine;
import com.fpt.medically_be.entity.NotificationRecipients;
import com.fpt.medically_be.entity.ResponseStatus;
import com.fpt.medically_be.entity.Vaccine;

import com.fpt.medically_be.mapper.NotificationRecipientVaccineMapper;
import com.fpt.medically_be.repos.NotificationRecipientVaccineRepo;
import com.fpt.medically_be.repos.NotificationRecipientsRepo;
import com.fpt.medically_be.repos.VaccineRepository;

import com.fpt.medically_be.service.NotificationRecipientVaccineService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationRecipientVaccineServiceImp implements NotificationRecipientVaccineService {
    @Autowired
    private NotificationRecipientVaccineMapper notificationRecipientVaccineMapper;
    @Autowired
    private NotificationRecipientVaccineRepo notificationRecipientVaccineRepository;
    @Autowired
    private NotificationRecipientsRepo notificationRecipientsRepository;
    @Autowired
    private VaccineRepository vaccineRepository;


    @Override
    @Transactional
    public void confirmVaccines(ConfirmVaccinesRequest request) {
        NotificationRecipients recipient = notificationRecipientsRepository
                .findById(request.getNotificationRecipientId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy recipient"));

        for (VaccineConfirmation vc : request.getConfirmations()) {
            Vaccine vaccine = vaccineRepository.findById(vc.getVaccineId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy vaccine id=" + vc.getVaccineId()));

            NotificationRecipientVaccine entity = notificationRecipientVaccineMapper.toEntity(vc);
            entity.setNotificationRecipient(recipient);
            entity.setVaccine(vaccine);
            entity.setParentNotes(vc.getParentNotes());

            notificationRecipientVaccineRepository.save(entity);
        }
    }
}
