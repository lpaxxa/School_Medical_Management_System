package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "Nurse")
@Data
public class Nurse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String qualification;

    @Column(name = "phone_number", columnDefinition = "NVARCHAR(11)")
    private String phoneNumber;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String email;

    @OneToMany(mappedBy = "medicalStaff")
    private List<MedicalCheckup> medicalCheckups;

    @OneToOne
    @JoinColumn(name = "account_id")
    private AccountMember account;

    @OneToMany(mappedBy = "handledBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicalIncident> handledIncidents;


}
