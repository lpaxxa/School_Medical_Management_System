package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "parents")
@Data
public class Parent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @Column(columnDefinition = "NVARCHAR(20)")
    private String phoneNumber;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String email;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;

    @Column(name = "relationship_type", columnDefinition = "NVARCHAR(255)")
    private String relationshipType;  // Father, Mother, Guardian, etc.

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Student> students;

    @OneToOne
    @JoinColumn(name = "account_id")
    private AccountMember account;

}
