package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByEmail(String email);
    Optional<Parent> findByPhoneNumber(String phoneNumber);
    Optional<Parent> findByAccountId(String accountId);

}
