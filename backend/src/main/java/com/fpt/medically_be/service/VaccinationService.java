package com.fpt.medically_be.service;


import com.fpt.medically_be.dto.request.VaccinationCreateDTO;
import com.fpt.medically_be.dto.request.VaccinationRequestDTO;
import com.fpt.medically_be.dto.request.VaccinationUpdateNoteRequest;
import com.fpt.medically_be.dto.response.StudentVaccinationHistoryResponse;
import com.fpt.medically_be.dto.response.VaccinationCreateWithHeathResponse;
import com.fpt.medically_be.dto.response.VaccineResponse;

import java.util.List;

public interface VaccinationService {

    void recordVaccination(VaccinationCreateDTO request);
    List<VaccinationCreateWithHeathResponse> addParentDeclaredVaccination(Long healthProfileId, List<VaccinationRequestDTO> dto);
    StudentVaccinationHistoryResponse getVaccinationHistoryForStudent(Long parentId, Long studentId);
    void updateVaccinationNote(VaccinationUpdateNoteRequest dto);

    void deleteVaccination(Long vaccinationId);

    VaccinationCreateWithHeathResponse getVaccinationById(Long vaccinationId);
    List<VaccinationCreateWithHeathResponse> getAllVaccination();
    List<VaccinationCreateWithHeathResponse>  getAllVaccinationByHeathProfileId(Long healthProfileId);
}
