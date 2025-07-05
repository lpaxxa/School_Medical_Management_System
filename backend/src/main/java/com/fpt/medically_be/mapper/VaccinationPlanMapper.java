package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.VaccinationPlanRequestDTO;
import com.fpt.medically_be.dto.VaccinationPlanResponseDTO;
import com.fpt.medically_be.dto.request.VaccinePlanCreateRequestDTO;
import com.fpt.medically_be.dto.response.*;
import com.fpt.medically_be.entity.NotificationRecipients;
import com.fpt.medically_be.entity.Vaccination;
import com.fpt.medically_be.entity.VaccinationPlan;
import com.fpt.medically_be.entity.VaccinationPlanStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VaccinationPlanMapper {

    VaccinationPlan toEntity(VaccinePlanCreateRequestDTO dto);

    VaccinePlanCreateResponse toCreateResponse(VaccinationPlan vaccinationPlan);


    VaccinationPlanListResponse toListResponse(VaccinationPlan vaccinationPlan);

    List<VaccinationPlanListResponse> toListResponse(List<VaccinationPlan> plans);

    VaccinationPlanDetailResponse toDetailResponse(VaccinationPlan vaccinationPlan);

    VaccinationPlanForParentResponse toParentResponse(VaccinationPlan plan);




}
