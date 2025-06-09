package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentDTO {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String address;
    private String relationshipType;
    private String accountId;
}
