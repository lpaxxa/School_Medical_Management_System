package com.fpt.medically_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentVaccinationHistoryResponse {
    private Long studentId;
    private String studentName;
    private String className;
    private List<VaccinationInfoResponse> vaccinations;
}
