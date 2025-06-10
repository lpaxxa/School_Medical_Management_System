package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.MedicationItemsRequest;
import com.fpt.medically_be.dto.response.MedicationItemsResponse;
import com.fpt.medically_be.entity.MedicationItems;

import com.fpt.medically_be.repos.MedicationItemsRepository;
import com.fpt.medically_be.service.MedicationItemsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class MedicationItemIml implements MedicationItemsService {

    @Autowired
    MedicationItemsRepository medicationItemsRepository;



    @Override
    public MedicationItemsResponse createMedicationItem(MedicationItems medicationItems) {

//        MedicationItems savedMedication = medicationItemsRepository.save(medicationItems);

        return  null;
    }

    @Override
    public MedicationItemsResponse getMedicationItemById(Long id) {
        return null;
    }

    @Override
    public MedicationItemsResponse getAllMedicationItems() {
        return null;
    }

    @Override
    public MedicationItemsRequest updateMedicationItem(Long id, MedicationItems medicationItemsRequest) {
        return null;
    }

    @Override
    public MedicationItemsResponse deleteMedicationItem(Long id) {
        return null;
    }

    @Override
    public MedicationItemsResponse filterMedicationItems(String name, String type, Date manufacturer, Date expiryDate) {
        return null;
    }

    @Override
    public MedicationItemsResponse getMedicationItemByName(String name) {
        return null;
    }
}
