package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.MedicalStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalStaffRepository extends JpaRepository<MedicalStaff, Long> {
    Optional<MedicalStaff> findByEmail(String email);
    Optional<MedicalStaff> findByAccountId(String accountId);
}
