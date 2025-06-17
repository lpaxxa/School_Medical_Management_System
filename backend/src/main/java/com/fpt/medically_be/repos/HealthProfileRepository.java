package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.HealthProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HealthProfileRepository extends JpaRepository<HealthProfile, Long> {
    Optional<HealthProfile> findByStudentId(Long studentId);
    // Custom queries can be added if needed
    @Query("SELECT h FROM HealthProfile h WHERE h.isActive = true")
    Page<HealthProfile> findAll(Pageable pageable);
}
