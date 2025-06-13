package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.HealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthProfileRepository extends JpaRepository<HealthProfile, Long> {
    Optional<HealthProfile> findByStudentId(Long studentId);
    List<HealthProfile> findByStudentIdIn(List<Long> studentIds);
    // Custom queries can be added if needed
}
