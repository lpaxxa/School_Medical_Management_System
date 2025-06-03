package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.VaccinationDTO;
import java.time.LocalDate;
import java.util.List;

public interface VaccinationService {
    List<VaccinationDTO> getAllVaccinations();
    VaccinationDTO getVaccinationById(Long id);
    List<VaccinationDTO> getVaccinationsByHealthProfileId(Long healthProfileId);
    List<VaccinationDTO> getVaccinationsByName(String vaccineName);
    List<VaccinationDTO> getVaccinationsByDateRange(LocalDate startDate, LocalDate endDate);
    List<VaccinationDTO> getUpcomingVaccinationsDue(LocalDate beforeDate);
    VaccinationDTO createVaccination(VaccinationDTO vaccinationDTO);
    VaccinationDTO updateVaccination(Long id, VaccinationDTO vaccinationDTO);
    void deleteVaccination(Long id);
}
