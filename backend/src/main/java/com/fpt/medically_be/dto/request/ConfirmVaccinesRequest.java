package com.fpt.medically_be.dto.request;

import com.fpt.medically_be.entity.ResponseStatus;
import lombok.Data;

import java.util.List;

@Data
public class ConfirmVaccinesRequest {
    private Long notificationRecipientId;
    private List<VaccineConfirmation> confirmations;

}
