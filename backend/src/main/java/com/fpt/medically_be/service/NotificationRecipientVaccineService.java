package com.fpt.medically_be.service;


import com.fpt.medically_be.dto.request.ConfirmVaccinesRequest;

public interface NotificationRecipientVaccineService {

    void confirmVaccines(ConfirmVaccinesRequest request);

}
