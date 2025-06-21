package com.fpt.medically_be.mapper;


import com.fpt.medically_be.dto.request.MedicationItemsRequest;
import com.fpt.medically_be.dto.response.MedicationItemsResponse;
import com.fpt.medically_be.entity.MedicationItems;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "Spring")
public interface MedicationItemsMapper {

    MedicationItems toMedicationItems(MedicationItemsRequest medicationItemsRequest);


    MedicationItemsResponse toMedicationItemsResponse(MedicationItems medicationItems);


    void updateMedicationItems(@MappingTarget MedicationItems medicationItems, MedicationItemsRequest medicationItemsRequest);
}
