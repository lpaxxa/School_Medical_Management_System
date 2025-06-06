package com.fpt.medically_be.repos;


import com.fpt.medically_be.entity.MedicalIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicalIncidentRepository extends JpaRepository<MedicalIncident, Long> {


    List<MedicalIncident> findByDateTimeBetweenAndSeverityLevel(LocalDateTime startDate, LocalDateTime endDate, String severityLevel);

    List<MedicalIncident> findByDateTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<MedicalIncident> findBySeverityLevel(String severityLevel);






}