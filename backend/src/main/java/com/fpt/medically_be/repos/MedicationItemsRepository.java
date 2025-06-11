package com.fpt.medically_be.repos;

import com.fpt.medically_be.dto.response.MedicationItemsResponse;
import com.fpt.medically_be.entity.MedicationItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Repository
public interface MedicationItemsRepository extends JpaRepository<MedicationItems, Integer> {


    boolean getMedicationItemsByItemName(String itemName);

    MedicationItems findMedicationItemsByItemName(String itemName);

    MedicationItems findMedicationItemsByItemNameContainingIgnoreCase(String itemName);

    List<MedicationItems> findByManufactureDateAndExpiryDate(LocalDate manufactureDate, LocalDate expiryDate);
}
