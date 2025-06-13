package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
public class MedicationItemsResponse {
    private String itemName;
    private Date manufactureDate;
    private Date expiryDate;
    private String unit;
    private int stockQuantity; // default = 0
    private String itemType; // e.g., "Medicine", "Equipment", "Supplies"
    private String itemDescription;
    private LocalDateTime createdAt;
}
