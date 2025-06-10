package com.fpt.medically_be.service;


import com.fpt.medically_be.dto.request.MedicationItemsRequest;
import com.fpt.medically_be.dto.response.MedicationItemsResponse;
import com.fpt.medically_be.entity.MedicationItems;

import java.util.Date;

public interface MedicationItemsService {

    MedicationItemsResponse createMedicationItem(MedicationItems medicationItems);
    MedicationItemsResponse getMedicationItemById(Long id);
    MedicationItemsResponse getAllMedicationItems();
    MedicationItemsRequest updateMedicationItem(Long id, MedicationItems medicationItemsRequest);
    MedicationItemsResponse deleteMedicationItem(Long id);
    MedicationItemsResponse filterMedicationItems(String name, String type, Date manufacturer, Date expiryDate);
    MedicationItemsResponse getMedicationItemByName(String name);


}
