package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
public class MedicationItemsResponse {
    private int itemId;
    private String itemName;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private String unit;
    private int stockQuantity; // default = 0
    private String itemType; // e.g., "Medicine", "Equipment", "Supplies"
    private String itemDescription;
    private LocalDateTime createdAt;
}
