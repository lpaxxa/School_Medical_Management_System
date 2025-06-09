package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Long> {
    Optional<Nurse> findByEmail(String email);
    Optional<Nurse> findByAccountId(String accountId);
    Optional<Nurse> findByAccount(AccountMember account);
    Optional<Nurse> findByFullName(String fullName);

}
