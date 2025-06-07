package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.response.MedicalIncidentNurseDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentResponseDTO;
import com.fpt.medically_be.dto.request.MedicalIncidentCreateDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentStudentDTO;
import com.fpt.medically_be.entity.MedicalIncident;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface MedicalIncidentMapper {

    // medicalIncident là cái sẽ set, còn MedicalIncidentCreateDTO là cái sẽ lấy từ request
    MedicalIncident toMedicalIncidentCreate(MedicalIncidentCreateDTO request);

    MedicalIncident toMedicalIncident(MedicalIncidentCreateDTO request);

    MedicalIncident toMedicalIncident(MedicalIncidentResponseDTO request);

    // getById,getAll, search,update
    @Mapping(source = "handledBy.id", target = "handledById")
    @Mapping(source = "student.id", target = "studentId")
    //huyển từ entity sang DTO.
    MedicalIncidentResponseDTO toMedicalIncidentResponseDto(MedicalIncident entity);
//    public MedicalIncidentResponseDTO toMedicalIncidentDto(MedicalIncident entity) {
//        MedicalIncidentResponseDTO dto = new MedicalIncidentResponseDTO();
//        dto.setId(entity.getId());
//        dto.setUsername(entity.getUsername());
//        // ... tiếp tục mapping
//        return dto;
//    }

    // ,mapping từ MedicalIncidentResponseDTO sang MedicalIncident
    @Mapping(source = "handledById", target = "handledBy.id")
     @Mapping(source = "studentId", target = "student.id")
    void updateMedicalIncident(@MappingTarget MedicalIncident entity, MedicalIncidentCreateDTO medicalIncidentResponseDTO);


    @Mapping(source = "handledBy.id", target = "handledById")
    @Mapping(source = "student.id", target = "studentId")
    @Mapping(source = "student.fullName", target = "fullName")
    @Mapping(source = "student.dateOfBirth", target = "dateOfBirth")
    @Mapping(source = "student.gender", target = "gender")
    @Mapping(source = "student.className", target = "className")
    @Mapping(source = "student.gradeLevel", target = "gradeLevel")
    @Mapping(source = "student.schoolYear", target = "schoolYear")
    @Mapping(source = "handledBy.fullName", target = "medicationName")
    MedicalIncidentStudentDTO toMedicalIncidentStudentDTO(MedicalIncident request);

    // nurse
    MedicalIncidentNurseDTO tomedicalIncidentNurseDTO(MedicalIncident request);
}
