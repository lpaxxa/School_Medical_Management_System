package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.HealthCampaign;
import com.fpt.medically_be.entity.HealthCampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthCampaignRepository extends JpaRepository<HealthCampaign, Long> {
    List<HealthCampaign> findByTitleContainingIgnoreCase(String title);
    List<HealthCampaign> findByStatus(HealthCampaignStatus status);
}
