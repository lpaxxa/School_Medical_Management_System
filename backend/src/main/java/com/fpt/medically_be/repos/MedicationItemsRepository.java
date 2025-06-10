package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.MedicationItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicationItemsRepository extends JpaRepository<MedicationItems, Integer> {


}
