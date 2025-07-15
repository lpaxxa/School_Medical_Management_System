package com.fpt.medically_be.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "students")
@Data
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(columnDefinition = "NVARCHAR(20)")
    private String gender;

    @Column(name = "student_id", unique = true, columnDefinition = "NVARCHAR(50)")
    private String studentId;

    @Column(name = "class_name", columnDefinition = "NVARCHAR(50)")
    private String className;

    @Column(name = "grade_level", columnDefinition = "NVARCHAR(50)")
    private String gradeLevel;

    @Column(name = "school_year", columnDefinition = "NVARCHAR(50)")
    private String schoolYear;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "health_profile_id")
    @JsonManagedReference("student-health")
    private HealthProfile healthProfile;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<MedicalCheckup> medicalCheckups;

    @ManyToOne
    @JoinColumn(name = "parent_id")
     private Parent parent;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<MedicalIncident> medicalIncidents;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<NotificationRecipients> notificationRecipients;

}
