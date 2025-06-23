package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.MedicationAdministration;
import com.fpt.medically_be.entity.AdministrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministration, Long> {
    
    // Find all administrations for a specific medication instruction with pagination
    Page<MedicationAdministration> findByMedicationInstructionId(Long medicationInstructionId, Pageable pageable);
    
    // Find administrations by student (through health profile) with pagination
    @Query("SELECT ma FROM MedicationAdministration ma " +
           "JOIN ma.medicationInstruction mi " +
           "JOIN mi.healthProfile hp " +
           "JOIN hp.student s " +
           "WHERE s.studentId = :studentId " +
           "ORDER BY ma.administeredAt DESC")
    Page<MedicationAdministration> findByStudentId(@Param("studentId") String studentId, Pageable pageable);
    

    
    // Find administrations by date range with pagination
    Page<MedicationAdministration> findByAdministeredAtBetweenOrderByAdministeredAtDesc(LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    // Find administrations by status with pagination
    Page<MedicationAdministration> findByAdministrationStatusOrderByAdministeredAtDesc(AdministrationStatus status, Pageable pageable);
    
    // Find recent administrations (for dashboards) with pagination
    @Query("SELECT ma FROM MedicationAdministration ma ORDER BY ma.administeredAt DESC")
    Page<MedicationAdministration> findRecentAdministrations(Pageable pageable);
    
    // Find administrations with full details for reporting
    @Query("SELECT ma FROM MedicationAdministration ma " +
           "JOIN FETCH ma.medicationInstruction mi " +
           "JOIN FETCH ma.administeredBy n " +
           "WHERE ma.id = :id")
    MedicationAdministration findByIdWithDetails(@Param("id") Long id);
} 