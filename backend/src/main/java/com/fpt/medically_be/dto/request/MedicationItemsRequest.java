package com.fpt.medically_be.dto.request;


import com.fpt.medically_be.entity.MedicationUsed;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
public class MedicationItemsRequest {
    private String itemName;
    private Date manufactureDate;
    private Date expiryDate;
    private String unit;
    private int stockQuantity; // default = 0
    private String itemType; // e.g., "Medicine", "Equipment", "Supplies"
    private String itemDescription;
    private LocalDateTime createdAt;

}
