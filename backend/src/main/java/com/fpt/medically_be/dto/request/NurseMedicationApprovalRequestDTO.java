package com.fpt.medically_be.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Valid
public class NurseMedicationApprovalRequestDTO {

    @NotBlank(message = "Decision is required")
    @Pattern(regexp = "APPROVED|REJECTED", message = "Decision must be APPROVED or REJECTED")
    private String decision;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason; // Required for REJECT


    // Custom validation
    @AssertTrue(message = "Reason is required for REJECT and REQUEST_MORE_INFO actions")
    public boolean isReasonProvidedWhenRequired() {
        if ("REJECT".equals(decision)) {
            return reason != null && !reason.trim().isEmpty();
        }
        return true;
    }
}
