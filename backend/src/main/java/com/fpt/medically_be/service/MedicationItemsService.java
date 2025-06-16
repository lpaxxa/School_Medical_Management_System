package com.fpt.medically_be.service;


import com.fpt.medically_be.dto.request.MedicationItemsRequest;
import com.fpt.medically_be.dto.response.MedicationItemsResponse;
import com.fpt.medically_be.entity.MedicationItems;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface MedicationItemsService {

    MedicationItemsResponse createMedicationItem(MedicationItemsRequest medicationItems);
    MedicationItemsResponse getMedicationItemById(int id);
    List<MedicationItemsResponse> getAllMedicationItems();
    MedicationItemsResponse updateMedicationItem(int id, MedicationItemsRequest medicationItemsRequest);
    boolean deleteMedicationItem(int id);

    List<MedicationItemsResponse> filterMedicationItems(LocalDate manufacturer, LocalDate expiryDate);
    MedicationItemsResponse getMedicationItemByName(String name);


}
