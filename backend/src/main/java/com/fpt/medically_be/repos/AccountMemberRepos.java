package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;

import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface AccountMemberRepos extends JpaRepository<AccountMember, String> {
    Optional<AccountMember> findAccountMemberByEmail(String email);
    Optional<AccountMember> findAccountMemberById(String id);
    Optional<AccountMember> findByEmail(String email);
    Optional<AccountMember> findByPhoneNumber(String phoneNumber);
    Optional<AccountMember> findAccountMemberByUsername(String username);

    // dt
    @NonNull
    List<AccountMember> findAll();
    Optional<AccountMember> findAccountMemberByIdAndIsActiveTrue(String id);

    List<AccountMember> findAllByIsActiveTrueAndEmailSent(Boolean emailSent);



}