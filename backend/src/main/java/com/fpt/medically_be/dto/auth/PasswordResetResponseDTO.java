package com.fpt.medically_be.dto.auth;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class PasswordResetResponseDTO {
    private String message;
    private boolean success;
    private LocalDateTime timestamp;
}