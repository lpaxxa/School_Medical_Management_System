package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Notification2TitleResponse {
    private Long id;
    private String title;
    private LocalDateTime receivedDate;
}