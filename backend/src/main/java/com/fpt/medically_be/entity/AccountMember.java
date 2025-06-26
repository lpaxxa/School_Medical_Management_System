package com.fpt.medically_be.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "member")

public class AccountMember {

    @Id
    @Column(columnDefinition = "NVARCHAR(50)")
    private String id;

    @Column(name = "username", columnDefinition = "NVARCHAR(50)")
    private String username;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String password;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String email;
    @Column(nullable = false, columnDefinition = "bit default 1")
    private Boolean status = true;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "NVARCHAR(20)")
    private MemberRole role;

    public AccountMember() {
    }

    public AccountMember(String id, String username, String password, String email, boolean status, String phoneNumber, MemberRole role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.status = status;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public MemberRole getRole() {
        return role;
    }

    public void setRole(MemberRole role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "AccountMember{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", email='" + email + '\'' +
                ", status=" + status +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", role=" + role +
                '}';
    }
}

