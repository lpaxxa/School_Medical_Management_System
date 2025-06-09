package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.base.BaseMapper;
import com.fpt.medically_be.entity.Nurse;
import lombok.*;

import java.util.logging.Logger;

@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class NurseProfileResponseDTO extends BaseMapper<Nurse, NurseProfileResponseDTO> {
    private static final Logger logger = Logger.getLogger(NurseProfileResponseDTO.class.getName());
    private Long id;
    private String accountId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String qualification;

     
}
