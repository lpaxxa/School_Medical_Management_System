package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class StudentInfoResponse {
    private Long id;
    private String fullName;
    private int healthProfileId;
    private String studentId;
    private String gender;
    private String dateOfBirth;
    private String className;
    private List<VaccineResponseDTO> vaccineResponses;
}
