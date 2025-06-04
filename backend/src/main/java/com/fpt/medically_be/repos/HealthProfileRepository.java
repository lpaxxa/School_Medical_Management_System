package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.HealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HealthProfileRepository extends JpaRepository<HealthProfile, Long> {
    // Custom queries can be added if needed
}
