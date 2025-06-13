package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.StudentDTO;
import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.entity.Parent;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.repos.ParentRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.StudentService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final HealthProfileRepository healthProfileRepository;

    @Autowired
    public StudentServiceImpl(StudentRepository studentRepository, ParentRepository parentRepository,
                              HealthProfileRepository healthProfileRepository) {
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.healthProfileRepository = healthProfileRepository;
    }

    @Override
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public StudentDTO getStudentById(Long id) {
        return studentRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy học sinh với ID: " + id));
    }



    @Override
    public StudentDTO getStudentByStudentId(Long studentId) {
        return studentRepository.findById(studentId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy học sinh với Mã học sinh: " + studentId));
    }

    @Override
    public List<StudentDTO> getStudentsByClass(String className) {
        return studentRepository.findByClassName(className).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getStudentsByGradeLevel(String gradeLevel) {
        return studentRepository.findByGradeLevel(gradeLevel).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getStudentsByParentId(Long parentId) {
        return studentRepository.findByParentId(parentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Đảm bảo mỗi học sinh đều có 1 hồ sơ sức khỏe
    @Override
    public StudentDTO createStudent(StudentDTO studentDTO) {
        Student student = convertToEntity(studentDTO);

        // Tạo mới HealthProfile nếu chưa có
        if (student.getHealthProfile() == null) {
            HealthProfile healthProfile = new HealthProfile();
            healthProfileRepository.save(healthProfile);
            student.setHealthProfile(healthProfile);
        }

        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }

    @Override
    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy học sinh với ID: " + id));

        // Cập nhật thông tin học sinh
        existingStudent.setFullName(studentDTO.getFullName());
        existingStudent.setDateOfBirth(studentDTO.getDateOfBirth());
        existingStudent.setGender(studentDTO.getGender());
        existingStudent.setStudentId(studentDTO.getStudentId());
        existingStudent.setClassName(studentDTO.getClassName());
        existingStudent.setGradeLevel(studentDTO.getGradeLevel());
        existingStudent.setSchoolYear(studentDTO.getSchoolYear());

        // Cập nhật trường imageUrl khi có giá trị
        if (studentDTO.getImageUrl() != null) {
            existingStudent.setImageUrl(studentDTO.getImageUrl());
        }

        // Cập nhật thông tin parent nếu có thay đổi
        if (studentDTO.getParentId() != null) {
            Parent parent = parentRepository.findById(studentDTO.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phụ huynh với ID: " + studentDTO.getParentId()));
            existingStudent.setParent(parent);
        }

        Student updatedStudent = studentRepository.save(existingStudent);
        return convertToDTO(updatedStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy học sinh với ID: " + id);
        }
        studentRepository.deleteById(id);
    }

    // Phương thức chuyển đổi từ Entity sang DTO
    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setFullName(student.getFullName());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setGender(student.getGender());
        dto.setStudentId(student.getStudentId());
        dto.setClassName(student.getClassName());
        dto.setGradeLevel(student.getGradeLevel());
        dto.setSchoolYear(student.getSchoolYear());

        if (student.getHealthProfile() != null) {
            dto.setHealthProfileId(student.getHealthProfile().getId());
        }

        if (student.getParent() != null) {
            dto.setParentId(student.getParent().getId());
        }

        return dto;
    }

    // Phương thức chuyển đổi từ DTO sang Entity
    private Student convertToEntity(StudentDTO dto) {
        Student student = new Student();
        student.setId(dto.getId());
        student.setFullName(dto.getFullName());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setGender(dto.getGender());
        student.setStudentId(dto.getStudentId());
        student.setClassName(dto.getClassName());
        student.setGradeLevel(dto.getGradeLevel());
        student.setSchoolYear(dto.getSchoolYear());

        // Thiết lập HealthProfile nếu có
        if (dto.getHealthProfileId() != null) {
            healthProfileRepository.findById(dto.getHealthProfileId())
                    .ifPresent(student::setHealthProfile);
        }

        // Thiết lập Parent nếu có
        if (dto.getParentId() != null) {
            parentRepository.findById(dto.getParentId())
                    .ifPresent(student::setParent);
        }

        return student;

    }
}
