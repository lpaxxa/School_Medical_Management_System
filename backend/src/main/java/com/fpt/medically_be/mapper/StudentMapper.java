package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.response.StudentInfoResponse;
import com.fpt.medically_be.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StudentMapper {

    StudentInfoResponse mapToStudentInfo(Student student);

    @Mapping(source = "healthProfile.id", target = "healthProfileId")
    StudentInfoResponse toInfoResponse(Student student);
}
