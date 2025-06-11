package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.List;

@Entity
@Data
public class MedicationItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int itemId;
    private String itemName;
    private LocalDate  manufactureDate;
    private LocalDate expiryDate;
    private String unit;
    private int stockQuantity; // default = 0
    private String itemType; // e.g., "Medicine", "Equipment", "Supplies"
    private String itemDescription;

    private LocalDateTime createdAt;
    @OneToMany(mappedBy = "itemID",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicationUsed> medicationUsedList; // List of medications used in incidents or treatments

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    }