package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.VaccinationPlanResponseDTO;
import com.fpt.medically_be.dto.request.VaccinePlanCreateRequestDTO;
import com.fpt.medically_be.dto.response.*;
import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.mapper.NotificationRecipientVaccineMapper;
import com.fpt.medically_be.mapper.StudentMapper;
import com.fpt.medically_be.mapper.VaccinationPlanMapper;
import com.fpt.medically_be.repos.*;
import com.fpt.medically_be.service.VaccinationPlanService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaccinationPlanServiceImp implements VaccinationPlanService {
    @Autowired
    private VaccineRepository vaccineRepository;
    @Autowired
    private VaccinationPlanRepository vaccinationPlanRepository;
    @Autowired
    private StudentRepository classRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private ParentRepository parentRepository;
    @Autowired
    private Notification2Repository notification2Repository;
    @Autowired
    private NotificationRecipientsRepo notificationRecipientsRepository;
    @Autowired
    private VaccinationPlanMapper vaccinationPlanMapper;
    @Autowired
    private VaccinationRepository vaccinationRepository;
    @Autowired
    private StudentMapper studentMapper;
    @Autowired
    private NotificationRecipientVaccineMapper notificationRecipientVaccineMapper;



        public VaccinationPlanDetailResponse getVaccinationPlanStudents(Long planId, String className) {
        VaccinationPlan plan = vaccinationPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Not found plan id=" + planId));

        List<NotificationRecipients> recipients = notificationRecipientsRepository
                .findByNotification_VaccinationPlan_Id(planId);

        // Filter theo className nếu có
        if (className != null && !className.isBlank()) {
            recipients = recipients.stream()
                    .filter(r -> className.equalsIgnoreCase(r.getStudent().getClassName()))
                    .toList();
        }

        VaccinationPlanDetailResponse response = vaccinationPlanMapper.toDetailResponse(plan);

        List<StudentInfoResponse> students = recipients.stream().map(recipient -> {
            Student student = recipient.getStudent();

            StudentInfoResponse dto = new StudentInfoResponse();
            dto.setId(student.getId());
            dto.setFullName(student.getFullName());
            dto.setStudentId(student.getStudentId());
            dto.setGender(student.getGender());
            dto.setDateOfBirth(student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : null);
            dto.setClassName(student.getClassName());

            List<VaccineResponseDTO> vaccineResponses = recipient.getNotificationRecipientVaccines().stream()
                    .map(nrv -> {
                        VaccineResponseDTO vr = new VaccineResponseDTO();
                        vr.setVaccineId(nrv.getVaccine().getId());
                        vr.setVaccineName(nrv.getVaccine().getName());
                        vr.setResponse(nrv.getResponse().name());
                        vr.setNotes(nrv.getParentNotes());
                        return vr;
                    }).toList();

            dto.setVaccineResponses(vaccineResponses);
            return dto;
        }).toList();

        response.setStudents(students);
        return response;
    }

    public void updateStatus(Long id, VaccinationPlanStatus status) {
        VaccinationPlan plan = vaccinationPlanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kế hoạch không tồn tại"));

        plan.setStatus(status);
        vaccinationPlanRepository.save(plan);
    }
    @Override
    public List<VaccinationPlanForParentResponse> getPlansForStudent(Long studentId) {
        List<NotificationRecipients> recipients = notificationRecipientsRepository.findByStudent_Id(studentId);

        return recipients.stream()
                .filter(rec -> rec.getNotification() != null && rec.getNotification().getVaccinationPlan() != null)
                .map(rec -> {
                    VaccinationPlan plan = rec.getNotification().getVaccinationPlan();

                    VaccinationPlanForParentResponse dto = vaccinationPlanMapper.toParentResponse(plan);
                    dto.setNotificationRecipientId(rec.getId());

                    return dto;
                })
                .toList();
    }




//    @Override
//    public List<VaccinationPlanForParentResponse> getPlansForStudent(Long studentId) {
//        List<NotificationRecipients> recipients = notificationRecipientsRepository.findByStudent_Id(studentId);
//
//        return recipients.stream()
//                .filter(rec -> rec.getNotification() != null && rec.getNotification().getVaccinationPlan() != null)
//                .map(rec -> {
//                    VaccinationPlan plan = rec.getNotification().getVaccinationPlan();
//
//                    VaccinationPlanForParentResponse dto = new VaccinationPlanForParentResponse();
//                    dto.setId(plan.getId());
//                    dto.setName(plan.getName());
//                    dto.setDescription(plan.getDescription());
//                    dto.setVaccinationDate(plan.getVaccinationDate());
//                    dto.setStatus(plan.getStatus().name());
//                    dto.setNotificationRecipientId(rec.getId());
//                    dto.setParentResponseStatus(rec.getResponse().name());
//                    dto.setRespondedAt(rec.getResponseAt());
//
//                    // Map vaccine info
//                    List<VaccineInfoResponse> vaccines = plan.getVaccines().stream().map(v -> {
//                        VaccineInfoResponse vi = new VaccineInfoResponse();
//                        vi.setId(v.getId());
//                        vi.setName(v.getName());
//                        vi.setDescription(v.getDescription());
//                        return vi;
//                    }).toList();
//                    dto.setVaccines(vaccines);
//
//                    return dto;
//                }).toList();
//    }


    @Override
    public VaccinationPlanDetailResponse getVaccinationPlanById(Long id) {

        VaccinationPlan plan = vaccinationPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found plan id=" + id));

        List<NotificationRecipients> recipients =
                notificationRecipientsRepository.findByNotification_VaccinationPlan_Id(id);

        // Thông tin chung của kế hoạch
        VaccinationPlanDetailResponse response = vaccinationPlanMapper.toDetailResponse(plan);

        // Danh sách học sinh và phản hồi từng vaccine
        List<StudentInfoResponse> students = recipients.stream().map(recipient -> {

            StudentInfoResponse dto = studentMapper.toInfoResponse(recipient.getStudent());

            List<VaccineResponseDTO> vaccineResponses = recipient.getNotificationRecipientVaccines()
                    .stream()
                    .map(notificationRecipientVaccineMapper::toDto)
                    .toList();

            dto.setVaccineResponses(vaccineResponses);
            return dto;

        }).toList();

        response.setStudents(students);
        return response;
    }





    @Override
    public List<VaccinationPlanListResponse> getAllPlans() {
        return vaccinationPlanRepository.findAll().stream().
                map(vaccinationPlanMapper::toListResponse)
                .collect(Collectors.toList());
    }


    @Override
    public List<VaccinationPlanListResponse> filterPlanByStatusOrName(VaccinationPlanStatus status, String planName) {

        List<VaccinationPlan> plans = vaccinationPlanRepository.findAllByStatusOrNameContainingIgnoreCase(status, planName);
        return vaccinationPlanMapper.toListResponse(plans);
    }

    @Transactional
    public VaccinePlanCreateResponse createVaccinationPlan(VaccinePlanCreateRequestDTO dto) {
        // 1. Lấy danh sách vaccine từ id
        List<Vaccine> vaccines = vaccineRepository.findAllById(dto.getVaccineIds());
        if (vaccines.isEmpty()) {
            throw new RuntimeException("No vaccines found");
        }

        // 2. Tạo kế hoạch tiêm chủng
        VaccinationPlan plan = vaccinationPlanMapper.toEntity(dto);
        plan.setVaccines(vaccines);
        plan.setStatus(VaccinationPlanStatus.WAITING_PARENT);
        plan = vaccinationPlanRepository.save(plan);

        // 3. Lấy danh sách học sinh theo className
        List<Student> students = studentRepository.findAllByClassNameIn(dto.getClassName());

        // 4. Tạo 1 notification chung cho tất cả học sinh cần nhận thông báo này
        Notification2 notification = new Notification2();
        notification.setTitle(
                dto.getCustomTitle() != null && !dto.getCustomTitle().isBlank()
                        ? dto.getCustomTitle()
                        : "Thông báo kế hoạch tiêm chủng: " + plan.getName()
        );
        notification.setMessage(
                dto.getCustomMessage() != null && !dto.getCustomMessage().isBlank()
                        ? dto.getCustomMessage()
                        : "Có kế hoạch tiêm chủng mới cho học sinh các lớp " + String.join(", ", dto.getClassName())
        );
        notification.setIsRequest(false);
        notification.setType(NotificationType.VACCINATION);
        notification.setVaccinationPlan(plan);

        notification = notification2Repository.save(notification);

        // 5. Lặp qua danh sách học sinh, tạo NotificationRecipients cho từng bạn đủ điều kiện
        List<NotificationRecipients> recipients = new ArrayList<>();
        for (Student student : students) {
            if (student.getHealthProfile() == null) continue;

            boolean needsVaccine = false;
            for (Vaccine vaccine : vaccines) {
                int vaccinatedCount = student.getHealthProfile().getVaccinations().stream()
                        .filter(vac -> vac.getVaccine().getId().equals(vaccine.getId()))
                        .mapToInt(vac -> 1)
                        .sum();
                if (vaccinatedCount < vaccine.getTotalDoses()) {
                    needsVaccine = true;
                    break;
                }
            }
            if (!needsVaccine) continue;

            Parent parent = student.getParent();
            if (parent != null) {
                NotificationRecipients recipient = new NotificationRecipients();
                recipient.setNotification(notification);
                recipient.setReceiver(parent);
                recipient.setStudent(student);
                recipient.setResponse(ResponseStatus.NOT_APPLICABLE);
                recipients.add(recipient);
            }
        }

        // Lưu tất cả recipients
        notificationRecipientsRepository.saveAll(recipients);

        return vaccinationPlanMapper.toCreateResponse(plan);
    }








}
