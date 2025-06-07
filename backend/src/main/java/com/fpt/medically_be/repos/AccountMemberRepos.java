package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface AccountMemberRepos extends JpaRepository<AccountMember, String> {
    Optional<AccountMember> findAccountMemberByEmail(String email);

    Optional<AccountMember> findAccountMemberById(String id);
    Optional<AccountMember> findAccountMemberByEmailAndPassword(String email, String password);

    Optional<AccountMember> findAccountMemberByEmailOrPassword(String email, String password);
    Optional<AccountMember> findAccountMemberByPhoneNumberAndPassword(String phone, String username);


    Optional<AccountMember> findByEmail(String email);
}