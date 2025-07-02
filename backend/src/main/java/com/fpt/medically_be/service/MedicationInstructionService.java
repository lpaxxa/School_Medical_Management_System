package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.request.MedicationRequestDTO;
import com.fpt.medically_be.dto.request.NurseMedicationApprovalRequestDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;

import com.fpt.medically_be.entity.Status;
import jakarta.validation.Valid;



import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

public interface MedicationInstructionService {
    List<MedicationInstructionDTO> getAllMedicationInstructions();
    MedicationInstructionDTO getMedicationInstructionById(Long id);
    List<MedicationInstructionDTO> getMedicationInstructionsByHealthProfileId(Long healthProfileId);
    List<MedicationInstructionDTO> getMedicationInstructionsByStatus(Status status);
    List<MedicationInstructionDTO> getExpiredMedicationInstructions(LocalDate date);
    List<MedicationInstructionDTO> getMedicationInstructionsByDateRange(LocalDate startDate, LocalDate endDate);
    List<MedicationInstructionDTO> getParentProvidedMedicationInstructions(Boolean parentProvided);
    MedicationInstructionDTO createMedicationInstruction(MedicationInstructionDTO medicationInstructionDTO);
    MedicationInstructionDTO updateMedicationInstruction(Long id, MedicationInstructionDTO medicationInstructionDTO);
    void deleteMedicationInstruction(Long id);

    //for sending-medication flow
    MedicationInstructionDTO createParentMedicationRequest(MedicationRequestDTO request, Authentication auth);
    //pagination
    List<MedicationInstructionDTO> getParentMedicationRequests(Authentication auth);
    List<MedicationInstructionDTO> getMedicationRequestsByChild(Long studentId, Authentication auth);
    MedicationInstructionDTO updateParentMedicationRequest(Long requestId, MedicationRequestDTO request, Authentication auth);

    List<MedicationInstructionDTO> getPendingMedicationRequests();
    List<MedicationInstructionDTO> getApprovedMedicationRequests();
    List<MedicationInstructionDTO> getRejectedMedicationRequests();
    List<MedicationInstructionDTO> getAllMedicationRequests();
    MedicationInstructionDTO processApprovalRequest(Long requestId, @Valid NurseMedicationApprovalRequestDTO approvalRequest, Authentication authentication);
   void cancelMedicationRequest(Long requestId, Authentication auth);

    public MedicationInstructionDTO uploadConfirmationImage(Long instructionId, MultipartFile imageFile, Authentication auth) throws IOException;


}

