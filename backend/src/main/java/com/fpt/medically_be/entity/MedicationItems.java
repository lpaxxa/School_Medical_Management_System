package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class MedicationItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int itemId;

    @Column(columnDefinition = "NVARCHAR(150)", nullable = false)
    private String itemName;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String unit;
    private int stockQuantity; // default = 0
    @Column(columnDefinition = "NVARCHAR(50)")
    private String itemType; // e.g., "Medicine", "Equipment", "Supplies"
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String itemDescription;
    private LocalDateTime createdAt;
    @OneToMany(mappedBy = "itemID",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicationUsed> medicationUsedList; // List of medications used in incidents or treatments

}