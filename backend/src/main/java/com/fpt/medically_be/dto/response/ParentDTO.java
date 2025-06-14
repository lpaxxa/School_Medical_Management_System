package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.base.BaseMapper;
import com.fpt.medically_be.entity.Parent;
import lombok.*;

import java.util.logging.Logger;
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentDTO extends BaseMapper<Parent, ParentDTO> {
    private static final Logger logger = Logger.getLogger(ParentDTO.class.getName());
    private Long id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String address;
    private String occupation;
    private String relationshipType;
    private String accountId;

    @Override
    public ParentDTO toObject(Parent entity) {

        if (entity == null) {
            return null;
        }

        this.id = entity.getId();
        this.fullName = entity.getFullName();
        this.phoneNumber = entity.getPhoneNumber();
        this.occupation = entity.getOccupation();
        this.email = entity.getEmail();
        this.address = entity.getAddress();
        this.relationshipType = entity.getRelationshipType();
        this.accountId = entity.getAccount() != null ? entity.getAccount().getId() : null;

        return this;
    }
    @Override
    public Parent toEntity(ParentDTO dto) {
        if (dto == null) {
            return null;
        }

        Parent entity = new Parent();
        entity.setId(dto.getId());
        entity.setFullName(dto.getFullName());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setEmail(dto.getEmail());
        entity.setAddress(dto.getAddress());
        entity.setOccupation(dto.getOccupation());
        entity.setRelationshipType(dto.getRelationshipType());

        return entity;
    }
}
