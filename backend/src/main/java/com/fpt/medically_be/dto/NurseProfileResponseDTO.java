package com.fpt.medically_be.dto;

import com.fpt.medically_be.base.BaseMapper;
import com.fpt.medically_be.dto.auth.AuthResponseDTO;
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

    @Override
    public NurseProfileResponseDTO toObject(Nurse entity) {
        if (entity == null) {
            return null;
        }

        this.id = entity.getId();
        this.accountId = entity.getAccount() != null ? entity.getAccount().getId() : null;
        this.email = entity.getEmail();
        this.fullName = entity.getFullName();
        this.phoneNumber = entity.getPhoneNumber();
        this.qualification = entity.getQualification();

        return this;
    }
}
