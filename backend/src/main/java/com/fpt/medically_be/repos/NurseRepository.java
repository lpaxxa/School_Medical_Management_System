package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Long> {
    Optional<Nurse> findById(Long id);
    Optional<Nurse> findByAccount_Id(String accountId);
    Optional<Nurse> findByAccountId(String accountId);
    Optional<Nurse> findNurseById(Long nurseId);
}
