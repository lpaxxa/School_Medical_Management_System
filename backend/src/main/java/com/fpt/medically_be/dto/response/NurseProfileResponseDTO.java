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

    @Override
    public NurseProfileResponseDTO toObject(Nurse entity) {
        if (entity == null) {
            return null;
        }
        NurseProfileResponseDTO dto = new NurseProfileResponseDTO();
        dto.setId(entity.getId());
        dto.setEmail(entity.getEmail());
        dto.setFullName(entity.getFullName());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setQualification(entity.getQualification());
        return dto;
    }
    @Override
    public Nurse toEntity(NurseProfileResponseDTO dto) {
        if (dto == null) {
            return null;
        }
        Nurse entity = new Nurse();
        entity.setId(dto.getId());
        entity.setEmail(dto.getEmail());
        entity.setFullName(dto.getFullName());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setQualification(dto.getQualification());
        return entity;
    }

     
}
