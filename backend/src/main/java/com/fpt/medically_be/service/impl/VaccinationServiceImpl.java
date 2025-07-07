package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.dto.request.VaccinationCreateDTO;
import com.fpt.medically_be.dto.request.VaccinationRequestDTO;
import com.fpt.medically_be.dto.request.VaccinationUpdateNoteRequest;
import com.fpt.medically_be.dto.response.StudentVaccinationHistoryResponse;
import com.fpt.medically_be.dto.response.VaccinationCreateWithHeathResponse;

import com.fpt.medically_be.dto.response.VaccinationInfoResponse;
import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.mapper.VaccinationMapper;
import com.fpt.medically_be.repos.*;
import com.fpt.medically_be.service.VaccinationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VaccinationServiceImpl implements VaccinationService {

    @Autowired
    private VaccinationRepository vaccinationRepository;
    @Autowired
    private VaccinationPlanRepository planRepo;
    @Autowired
    private HealthProfileRepository healthProfileRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private VaccinationMapper vaccinationMapper;
    @Autowired
    private NotificationRecipientsRepo notificationRecipientsRepo;
    @Autowired
    private NurseRepository nurseRepository;
    @Autowired
    private VaccineRepository vaccineRepository;

    @Override
    @Transactional
    public void updateVaccinationNote(VaccinationUpdateNoteRequest dto) {
        Vaccination vaccination = vaccinationRepository.findById(dto.getVaccinationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi tiêm"));

        vaccination.setNotes(dto.getNotes());
        vaccinationRepository.save(vaccination);
    }

    @Override
    public StudentVaccinationHistoryResponse getVaccinationHistoryForStudent(Long parentId, Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));

        if (!student.getParent().getId().equals(parentId)) {
            throw new RuntimeException("Không có quyền xem thông tin học sinh này");
        }

        HealthProfile profile = student.getHealthProfile();
        if (profile == null) {
            throw new RuntimeException("Học sinh chưa có hồ sơ sức khỏe");
        }

        List<Vaccination> vaccinations = vaccinationRepository
                .findByHealthProfile_Student_IdOrderByVaccinationDateDesc(studentId);

        List<VaccinationInfoResponse> vaccinationDtos = vaccinations.stream()
                .map(v -> {
                    return new VaccinationInfoResponse(
                            v.getVaccine().getName(),
                            v.getDoseNumber(),
                            v.getVaccinationDate(),
                            v.getAdministeredAt(),
                            v.getNurse() != null ? v.getNurse().getFullName() : null,
                            v.getVaccinationType().name(),
                            v.getVaccinationPlan() != null ? v.getVaccinationPlan().getName() : null,
                            v.getNotes(),
                            v.getNextDoseDate()
                    );
                }).toList();

        return new StudentVaccinationHistoryResponse(
                student.getId(),
                student.getFullName(),
                student.getClassName(),
                vaccinationDtos
        );
    }


    @Override
    @Transactional
    public void recordVaccination(VaccinationCreateDTO req) {

        // 1. Tìm entity liên quan
        HealthProfile profile = healthProfileRepository.findById(req.getHealthProfileId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy health profile"));
        Vaccine vaccine = vaccineRepository.findById(req.getVaccineId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vaccine"));
        Nurse nurse   = nurseRepository.findById(req.getNurseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nurse"));

        VaccinationPlan plan = null;
        if (req.getVaccinationPlanId() != null) {
            plan = planRepo.findById(req.getVaccinationPlanId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch tiêm"));
        }

        // 2. Kiểm tra đã tiêm bao nhiêu mũi
        int taken = vaccinationRepository.countByHealthProfile_IdAndVaccine_Id(
                profile.getId(), vaccine.getId());

        if (taken >= vaccine.getTotalDoses()) {
            throw new RuntimeException("Học sinh đã tiêm đủ số mũi của vaccine này");
        }

        int newDoseNumber = taken + 1;              // 3. doseNumber tự động tăng

        // 4. Tính nextDoseDate (nếu còn mũi kế tiếp)
        LocalDate nextDoseDate = null;
        if (newDoseNumber < vaccine.getTotalDoses()
                && vaccine.getIntervalDays() != null) {
            nextDoseDate = req.getVaccinationDate()      // LocalDateTime, lấy phần ngày
                    .toLocalDate()
                    .plusDays(vaccine.getIntervalDays());
        }

        // 5. Lưu bản ghi mới
        Vaccination v = new Vaccination();
        v.setHealthProfile(profile);
        v.setVaccine(vaccine);
        v.setNurse(nurse);
        v.setVaccinationDate(req.getVaccinationDate());
        v.setDoseNumber(newDoseNumber);
        v.setAdministeredAt(req.getAdministeredAt());
        v.setNotes(req.getNotes());
        v.setVaccinationType(plan != null ? VaccinationType.SCHOOL_PLAN
                : VaccinationType.CATCH_UP);
        v.setNextDoseDate(nextDoseDate);
        if (plan != null) {
            if (plan.getStatus() == VaccinationPlanStatus.WAITING_PARENT) {
                plan.setStatus(VaccinationPlanStatus.IN_PROGRESS);
                planRepo.save(plan);
            }
            v.setVaccinationPlan(plan);
        }

        vaccinationRepository.save(v);
    }

    @Transactional
    @Override
    public List<VaccinationCreateWithHeathResponse> addParentDeclaredVaccination(Long healthProfileId, List<VaccinationRequestDTO> vaccinationRequests) {

        HealthProfile profile = healthProfileRepository.findById(healthProfileId)
                .orElseThrow(() -> new RuntimeException("Health profile not found"));

        List<VaccinationCreateWithHeathResponse> results = new ArrayList<>();

        for (VaccinationRequestDTO dto : vaccinationRequests) {
            Vaccine vaccine = vaccineRepository.findById(dto.getVaccineId())
                    .orElseThrow(() -> new RuntimeException("Vaccine not found: " + dto.getVaccineId()));

            Integer nextDoseNumber = getNextDoseNumber(profile.getId(), vaccine.getId());

            // Check if vaccination is complete
            if (nextDoseNumber > vaccine.getTotalDoses()) {
                throw new IllegalArgumentException(
                        String.format("Vaccine %s đã tiêm đủ %d mũi rồi",
                                vaccine.getName(), vaccine.getTotalDoses())
                );
            }

            // Create vaccination entity
            Vaccination vaccination = vaccinationMapper.toEntity(dto);
            vaccination.setHealthProfile(profile);
            vaccination.setVaccine(vaccine);
            vaccination.setDoseNumber(nextDoseNumber);
            vaccination.setVaccinationType(VaccinationType.PARENT_DECLARED);

            Vaccination savedVaccination = vaccinationRepository.save(vaccination);

            VaccinationCreateWithHeathResponse resultDto = vaccinationMapper.toCreateWithHealthResponse(savedVaccination);
            results.add(resultDto);
        }

        return results;
    }




    private Integer getNextDoseNumber(Long profileId, Long vaccineId) {
        // Lấy mũi cuối cùng đã tiêm cho vaccine này
        Integer lastDose = vaccinationRepository.findMaxDoseNumberByHealthProfileIdAndVaccineId(profileId, vaccineId);
        return lastDose == null ? 1 : lastDose + 1;
    }



}


