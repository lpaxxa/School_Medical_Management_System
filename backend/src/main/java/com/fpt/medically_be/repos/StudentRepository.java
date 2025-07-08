package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.Student;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findById(Long studentId);
    List<Student> findByClassName(String className);
    List<Student> findByGradeLevel(String gradeLevel);
    List<Student> findByParentId(Long parentId);


    @Query("SELECT s FROM Student s JOIN s.healthProfile hp WHERE hp.id = :healthProfileId")
    Optional<Student> findByHealthProfileId(Long healthProfileId);

    //dt
    List<Student> findByStudentIdIn(List<String> ids);

    // Lấy tất cả học sinh trong một lớp cụ thể

    List<Student> findByClassNameIn(List<String> classNames);
    // Lấy tất cả học sinh trong một lớp cụ thể
    List<Student> findAllByClassName(String className);

    List<Student> findAllByClassNameIn(List<String> className);


    @EntityGraph(attributePaths = {
            "healthProfile",
            "healthProfile.vaccinations"
    })
    Optional<Student> findStudentByStudentId(String studentId);

}