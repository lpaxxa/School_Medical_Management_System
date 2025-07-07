package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;

import com.fpt.medically_be.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByEmail(String email);
    Optional<Parent> findByPhoneNumber(String phoneNumber);

    Optional<Parent> findByAccount(AccountMember account);

    Optional<Parent> findByAccountId(String accountId);

    Optional<Parent> findByAccount_Id(String accountId);
    List<Parent> findByIdIn(List<Long> id);

    List<Parent> findAllByStudents_Id(Long studentsId);
}
