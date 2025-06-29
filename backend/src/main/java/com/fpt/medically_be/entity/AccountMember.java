package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "member")
@Data
public class AccountMember {

    @Id
    @Column(columnDefinition = "NVARCHAR(50)")
    private String id;

    @Column(name = "username", columnDefinition = "NVARCHAR(50)")
    private String username;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String password;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String email;


    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "NVARCHAR(20)")
    private MemberRole role;


    @Column(name = "is_active", nullable = false, columnDefinition = "bit default 1")
    private Boolean isActive = true;


    @Column(name = "email_sent",nullable = false)
    private Boolean emailSent = false;

}

