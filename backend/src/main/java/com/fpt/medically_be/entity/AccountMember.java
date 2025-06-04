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

    @Column(columnDefinition = "NVARCHAR(255)")
    private String password;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String email;


    @Column(name = "phone_number", columnDefinition = "NVARCHAR(20)")
    private String username;


    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "NVARCHAR(20)")
    private MemberRole role;
}

