package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.ResponseStatus;
import lombok.Data;

@Data
public class VaccineInfoResponse {
    private Long id;
    private String name;
    private String description;
    private ResponseStatus response;
}
