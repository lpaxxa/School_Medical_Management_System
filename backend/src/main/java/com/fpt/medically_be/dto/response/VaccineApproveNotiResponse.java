package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VaccineApproveNotiResponse {

    private Long id;
    private String title;
    private String message;
    private LocalDateTime receivedAt;

}
