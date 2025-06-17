package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.MedicationItemsRequest;
import com.fpt.medically_be.dto.response.MedicationItemsResponse;
import com.fpt.medically_be.entity.MedicationItems;


import com.fpt.medically_be.mapper.MedicationItemsMapper;
import com.fpt.medically_be.repos.MedicationItemsRepository;
import com.fpt.medically_be.service.MedicationItemsService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;



@Service
public class MedicationItemIml implements MedicationItemsService {
    @Autowired
    MedicationItemsMapper medicationItemsMapper;

    @Autowired
    MedicationItemsRepository medicationItemsRepository;


    @Transactional
    @Override
    public MedicationItemsResponse createMedicationItem(MedicationItemsRequest medicationItems) {

        if (medicationItems.getManufactureDate() != null && medicationItems.getExpiryDate() != null) {
            if (medicationItems.getManufactureDate().isAfter(medicationItems.getExpiryDate())) {
                throw new IllegalArgumentException("Manufacture date must be before or equal to expiry date");
            }
        }

        if(medicationItemsRepository.findMedicationItemsByItemNameIgnoreCase(medicationItems.getItemName())!=null) {
            throw new IllegalArgumentException("Medication item with this name already exists");
        }


        MedicationItems medication = medicationItemsMapper.toMedicationItems(medicationItems);

        medication.setCreatedAt(LocalDateTime.now());
        return medicationItemsMapper.toMedicationItemsResponse(medicationItemsRepository.save(medication));
    }

    @Override
    public MedicationItemsResponse getMedicationItemById(int id) {

        MedicationItems medicationItems = medicationItemsRepository.findById(id).orElseThrow(()
                -> new IllegalArgumentException("Medication item not found with id: " + id));

        return medicationItemsMapper.toMedicationItemsResponse(medicationItems);
    }

    @Override
    public List<MedicationItemsResponse> getAllMedicationItems() {

        return medicationItemsRepository.findAll().stream()
                .map(medicationItemsMapper::toMedicationItemsResponse)
                .toList();

    }



    @Transactional
    @Override
    public MedicationItemsResponse updateMedicationItem(int id, MedicationItemsRequest medicationItemsRequest) {

        MedicationItems existingMedicationItem = medicationItemsRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Medication item not found with id: " + id));

        Optional<MedicationItems> sameNameItem = medicationItemsRepository
                .findByItemNameIgnoreCase(medicationItemsRequest.getItemName());

        if (sameNameItem.isPresent() && sameNameItem.get().getItemId() != id) {
            throw new IllegalArgumentException("Medication item with this name already exists");
        }

        if (medicationItemsRequest.getManufactureDate() != null && medicationItemsRequest.getExpiryDate() != null) {
            if (medicationItemsRequest.getManufactureDate().isAfter(medicationItemsRequest.getExpiryDate())) {
                throw new IllegalArgumentException("Manufacture date must be before or equal to expiry date");
            }
        }




        medicationItemsMapper.updateMedicationItems(existingMedicationItem, medicationItemsRequest);

        return medicationItemsMapper.toMedicationItemsResponse(existingMedicationItem);
    }

    @Transactional
    @Override
    public boolean deleteMedicationItem(int id) {

        if(medicationItemsRepository.existsById(id)) {
            medicationItemsRepository.deleteById(id);
            return true;
        }else{
            throw new IllegalArgumentException("Medication item not found with id: " + id);
        }



    }

    @Override
    public List<MedicationItemsResponse> filterMedicationItems(LocalDate manufacturer, LocalDate expiryDate) {
        List<MedicationItems> medicationItemsList = medicationItemsRepository.findByManufactureDateAndExpiryDate(manufacturer, expiryDate);
        if (medicationItemsList.isEmpty()) {
            throw new IllegalArgumentException("No medication items found for the given dates");
        }
        return medicationItemsList.stream()
                .map(medicationItemsMapper::toMedicationItemsResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationItemsResponse> getMedicationItemByName(String name) {

        List<MedicationItems> medicationItems = medicationItemsRepository.findMedicationItemsByItemNameContainingIgnoreCase(name);
        if (medicationItems == null) {
            throw new IllegalArgumentException("Medication item not found with name: " + name);
        }
        return medicationItems.stream().map(
                medicationItemsMapper::toMedicationItemsResponse
        ).collect(Collectors.toList());



    }
}
