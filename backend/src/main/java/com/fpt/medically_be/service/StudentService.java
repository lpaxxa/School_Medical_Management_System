package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.StudentDTO;
import java.util.List;

public interface StudentService {
    List<StudentDTO> getAllStudents();
    StudentDTO getStudentById(Long id);


    StudentDTO getStudentByStudentId(Long studentId);

    List<StudentDTO> getStudentsByClass(String className);
    List<StudentDTO> getStudentsByGradeLevel(String gradeLevel);
    List<StudentDTO> getStudentsByParentId(Long parentId);
    StudentDTO createStudent(StudentDTO studentDTO);
    StudentDTO updateStudent(Long id, StudentDTO studentDTO);
    void deleteStudent(Long id);

}
