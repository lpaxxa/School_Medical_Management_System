package com.fpt.medically_be.dto.response;

import lombok.Data;

@Data
public class VaccineInforRequest {

    private Long notificationRecipientID;
    private Long nurseID;
    private Long healthProfileID;
    private String studentID;
    private String imageUrl;
    private String gender;
    private String className;
    private String studentName;
}
