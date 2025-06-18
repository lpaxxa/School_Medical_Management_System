package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.request.MedicalIncidentCreateDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentResponseDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentStudentDTO;
import com.fpt.medically_be.entity.MedicalIncident;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MedicalIncidentMapper {

    MedicalIncident toMedicalIncident(MedicalIncidentResponseDTO request);

    MedicalIncident toMedicalIncidentCreate(MedicalIncidentCreateDTO request);

    MedicalIncident toMedicalIncident(MedicalIncidentCreateDTO request);

    // getById,getAll, search,update
    @Mapping(source = "handledBy.id", target = "staffId")
    @Mapping(source = "student.studentId", target = "studentId")
    @Mapping(source = "student.fullName", target = "studentName")
    @Mapping(source = "handledBy.fullName",target = "staffName")
    @Mapping(target = "medicationsUsed", expression = "java(mapMedicationsUsed(entity))")
    MedicalIncidentResponseDTO toMedicalIncidentDto(MedicalIncident entity);

    MedicalIncidentResponseDTO toMedicalIncidentResponseDto(MedicalIncident entity);

    default String mapMedicationsUsed(MedicalIncident entity) {
        if (entity.getMedications() == null || entity.getMedications().isEmpty()) {
            return null;
        }
        return entity.getMedications().stream()
                .map(m -> m.getItemID().getItemName()+ " (" + m.getQuantityUsed() + ")")
                .reduce((a, b) -> a + ", " + b).orElse(null);
    }

    @Mapping(source = "handledById", target = "handledBy.id")
    @Mapping(source = "studentId", target = "student.id")
    void updateMedicalIncident(@MappingTarget MedicalIncident entity, MedicalIncidentCreateDTO medicalIncidentResponseDTO);

    @Mapping(source = "handledBy.id", target = "staffId")
    @Mapping(source = "student.studentId", target = "studentId")
    @Mapping(source = "student.fullName", target = "fullName")
    @Mapping(source = "student.dateOfBirth", target = "dateOfBirth")
    @Mapping(source = "student.gender", target = "gender")
    @Mapping(source = "student.className", target = "className")
    @Mapping(source = "student.gradeLevel", target = "gradeLevel")
    @Mapping(source = "student.schoolYear", target = "schoolYear")
    @Mapping(source = "handledBy.fullName", target = "staffName")
    @Mapping(source = "student.parent.fullName", target = "fullNameParent")
    @Mapping(source = "student.parent.phoneNumber", target = "phoneNumber")
    @Mapping(target = "medicationsUsed", expression = "java(mapMedicationsUsed(request))")
    MedicalIncidentStudentDTO toMedicalIncidentStudentDTO(MedicalIncident request);
}