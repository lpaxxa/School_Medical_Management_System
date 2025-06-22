package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.dto.request.VaccinationRequestDTO;
import com.fpt.medically_be.dto.response.VaccinationDetailResponse;
import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.entity.NotificationRecipients;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.entity.Vaccination;
import com.fpt.medically_be.mapper.VaccinationMapper;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.repos.NotificationRecipientsRepo;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.repos.VaccinationRepository;
import com.fpt.medically_be.service.VaccinationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VaccinationServiceImpl implements VaccinationService {

    @Autowired
    private VaccinationRepository vaccinationRepository;
    @Autowired
    private HealthProfileRepository healthProfileRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private VaccinationMapper vaccinationMapper;
    @Autowired
    private NotificationRecipientsRepo notificationRecipientsRepo;




    //    @Autowired
//    public VaccinationServiceImpl(VaccinationRepository vaccinationRepository,
//                                 HealthProfileRepository healthProfileRepository,
//                                 StudentRepository studentRepository) {
//        this.vaccinationRepository = vaccinationRepository;
//        this.healthProfileRepository = healthProfileRepository;
//        this.studentRepository = studentRepository;
//    }

//    @Override
//    public List<VaccinationDTO> getAllVaccinations() {
//        return vaccinationRepository.findAll().stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public VaccinationDTO getVaccinationById(Long id) {
//        return vaccinationRepository.findById(id)
//                .map(this::convertToDTO)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin tiêm chủng với ID: " + id));
//    }
//
//    @Override
//    public List<VaccinationDTO> getVaccinationsByHealthProfileId(Long healthProfileId) {
//        return vaccinationRepository.findByHealthProfileId(healthProfileId).stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<VaccinationDTO> getVaccinationsByName(String vaccineName) {
//        return vaccinationRepository.findByVaccineName(vaccineName).stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<VaccinationDTO> getVaccinationsByDateRange(LocalDate startDate, LocalDate endDate) {
//        return vaccinationRepository.findByVaccinationDateBetween(startDate, endDate).stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<VaccinationDTO> getUpcomingVaccinationsDue(LocalDate beforeDate) {
//        return vaccinationRepository.findByNextDoseDateBefore(beforeDate).stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//    }
//
    @Override
    public VaccinationDetailResponse createVaccination(VaccinationRequestDTO vaccinationRequestDTO) {

        HealthProfile heathProfile = healthProfileRepository
                .findById(vaccinationRequestDTO.getHealthProfileId()).orElseThrow(() -> new EntityNotFoundException("Health Profile Not Found"));

        Vaccination vaccination = vaccinationMapper.toVaccinationDetailRequest(vaccinationRequestDTO);
        Vaccination savedVaccination = vaccinationRepository.save(vaccination);
        return vaccinationMapper.toVaccinationDetailResponse(savedVaccination);
    }
//
//    @Override
//    public VaccinationDTO updateVaccination(Long id, VaccinationDTO vaccinationDTO) {
//        Vaccination existingVaccination = vaccinationRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin tiêm chủng với ID: " + id));
//
//
//        // Cập nhật health profile nếu có thay đổi
//        if (vaccinationDTO.getHealthProfileId() != null &&
//            !vaccinationDTO.getHealthProfileId().equals(existingVaccination.getHealthProfile().getId())) {
//            HealthProfile healthProfile = healthProfileRepository.findById(vaccinationDTO.getHealthProfileId())
//                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe với ID: " + vaccinationDTO.getHealthProfileId()));
//            existingVaccination.setHealthProfile(healthProfile);
//        }
//
//        Vaccination updatedVaccination = vaccinationRepository.save(existingVaccination);
//        return convertToDTO(updatedVaccination);
//    }
//
    @Override
    public void deleteVaccination(Long id) {
        if (!vaccinationRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy thông tin tiêm chủng với ID: " + id);
        }
        vaccinationRepository.deleteById(id);
    }

    @Override
    public List<VaccinationDTO> getAllVaccinations() {
        List<Vaccination> vaccinations = vaccinationRepository.findAll();
        return vaccinations.stream().map(vaccinationMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public VaccinationDTO getVaccinationById(Long id) {
        Vaccination vaccination = vaccinationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin tiêm chủng với ID: " + id));
        return vaccinationMapper.toDTO(vaccination);
    }

    @Override
    public List<VaccinationDTO> getVaccinationsByHealthProfileId(Long healthProfileId) {
        List<Vaccination> vaccinations = vaccinationRepository.findByHealthProfileId(healthProfileId);
        return vaccinations.stream().map(vaccinationMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<VaccinationDTO> getVaccinationsByName(String vaccineName) {
        List<Vaccination> vaccinations = vaccinationRepository.findByVaccineName(vaccineName);
        return vaccinations.stream().map(vaccinationMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<VaccinationDTO> getVaccinationsByDateRange(LocalDate startDate, LocalDate endDate) {
        List<Vaccination> vaccinations = vaccinationRepository.findByVaccinationDateBetween(startDate, endDate);
        return vaccinations.stream().map(vaccinationMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<VaccinationDTO> getUpcomingVaccinationsDue(LocalDate beforeDate) {
        List<Vaccination> vaccinations = vaccinationRepository.findByNextDoseDateBefore(beforeDate);
        return vaccinations.stream().map(vaccinationMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<VaccinationDTO> getVaccinationsByParent(Long parentId) {
        List<Vaccination> vaccinations = vaccinationRepository.findByHealthProfile_Student_Parent_Id(parentId);
        return vaccinations.stream().map(vaccinationMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public VaccinationDetailResponse getVaccinationDetailByNotificationRecipientId(Long id) {
        NotificationRecipients noti = notificationRecipientsRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Id not fount !!!" + id));
        Vaccination vaccination = noti.getVaccinations().isEmpty() ? null : noti.getVaccinations().get(0);
        if (vaccination == null) throw new RuntimeException("Chưa có dữ liệu tiêm cho học sinh này!");


        return vaccinationMapper.toVaccinationDetailResponse(vaccination);
    }


//    // Phương thức chuyển đổi từ Entity sang DTO
//    private VaccinationDTO convertToDTO(Vaccination vaccination) {
//        VaccinationDTO dto = new VaccinationDTO();
//
//
//        if (vaccination.getHealthProfile() != null) {
//            dto.setHealthProfileId(vaccination.getHealthProfile().getId());
//
//            // Tìm tên học sinh từ health profile
//            Optional<Student> student = studentRepository.findByHealthProfileId(vaccination.getHealthProfile().getId());
//            student.ifPresent(value -> dto.setStudentName(value.getFullName()));
//        }
//
//        return dto;
//    }

    // Phương thức chuyển đổi từ DTO sang Entity
//    private Vaccination convertToEntity(VaccinationDTO dto) {
//        Vaccination vaccination = new Vaccination();
//
//
//        // Thiết lập health profile
//        if (dto.getHealthProfileId() != null) {
//            healthProfileRepository.findById(dto.getHealthProfileId())
//                    .ifPresent(vaccination::setHealthProfile);
//        }
//
//        return vaccination;
//    }
}

