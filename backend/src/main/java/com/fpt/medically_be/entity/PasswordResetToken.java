package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "password_reset_token")
@Data
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Make sure this is present
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    private AccountMember accountMember;

    @Column(nullable = false)
    private Date expiryDate;
}
