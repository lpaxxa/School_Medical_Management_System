package com.fpt.medically_be.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Entity
@Data
public class MedicationUsed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int usageId;
    @Min(value = 0, message = "Quantity must be at least 0")
    @Max(value = 10000, message = "Quantity cannot be greater than 10000")
    private  int quantityUsed;

    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "item_ID")
    private MedicationItems itemID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_ID")
    private  MedicalIncident incidentId;


}
