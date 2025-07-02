package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.MedicationAdministration;
import com.fpt.medically_be.entity.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

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
    Page<MedicationAdministration> findByAdministrationStatusOrderByAdministeredAtDesc(Status status, Pageable pageable);
    
    // Find recent administrations (for dashboards) with pagination
    @Query("SELECT ma FROM MedicationAdministration ma ORDER BY ma.administeredAt DESC")
    Page<MedicationAdministration> findRecentAdministrations(Pageable pageable);
    
    // Find administrations with full details for reporting
    @Query("SELECT ma FROM MedicationAdministration ma " +
           "JOIN FETCH ma.medicationInstruction mi " +
           "JOIN FETCH ma.administeredBy n " +
           "WHERE ma.id = :id")
    MedicationAdministration findByIdWithDetails(@Param("id") Long id);
    
    // Non-paginated methods
    
    // Find all administrations for a specific medication instruction (no pagination)
    List<MedicationAdministration> findByMedicationInstructionIdOrderByAdministeredAtDesc(Long medicationInstructionId);
    
    // Find all administrations by student (no pagination)
    @Query("SELECT ma FROM MedicationAdministration ma " +
           "JOIN ma.medicationInstruction mi " +
           "JOIN mi.healthProfile hp " +
           "JOIN hp.student s " +
           "WHERE s.studentId = :studentId " +
           "ORDER BY ma.administeredAt DESC")
    List<MedicationAdministration> findAllByStudentId(@Param("studentId") String studentId);
    
    // Find all administrations by date range (no pagination)
    List<MedicationAdministration> findByAdministeredAtBetweenOrderByAdministeredAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Find all administrations by status (no pagination)
    List<MedicationAdministration> findByAdministrationStatusOrderByAdministeredAtDesc(Status status);
    
    // Find all recent administrations (no pagination)
    @Query("SELECT ma FROM MedicationAdministration ma ORDER BY ma.administeredAt DESC")
    List<MedicationAdministration> findAllRecentAdministrations();
    
    // Find all administrations (no pagination)
    @Query("SELECT ma FROM MedicationAdministration ma ORDER BY ma.administeredAt DESC")
    List<MedicationAdministration> findAllOrderByAdministeredAtDesc();
} 