package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.MedicalIncidentDTO;
import com.fpt.medically_be.entity.MedicalIncident;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;


@Mapper(componentModel = "spring")
public interface MedicalIncidentMapper {



    MedicalIncident toMedicalIncident(MedicalIncidentDTO request);

    // getById,getAll, search,update
    @Mapping(source = "handledBy.id", target = "handledById")
    @Mapping(source = "student.id", target = "studentId")
    //huyển từ entity sang DTO.
    MedicalIncidentDTO toMedicalIncidentDto(MedicalIncident entity);
//    public MedicalIncidentDTO toMedicalIncidentDto(MedicalIncident entity) {
//        MedicalIncidentDTO dto = new MedicalIncidentDTO();
//        dto.setId(entity.getId());
//        dto.setUsername(entity.getUsername());
//        // ... tiếp tục mapping
//        return dto;
//    }

            @Mapping(source = "handledById", target = "handledBy.id")
            @Mapping(source = "studentId", target = "student.id")
        @Mapping(target = "incidentId", ignore = true)
    void updateMedicalIncident(@MappingTarget MedicalIncident entity, MedicalIncidentDTO medicalIncidentDTO);

}
