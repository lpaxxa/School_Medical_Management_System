package com.fpt.medically_be.dto.request;


import com.fpt.medically_be.entity.MedicationUsed;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
public class MedicationItemsRequest {

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String itemName;
    @Column(nullable = false)
    private LocalDate manufactureDate;
    @Column(nullable = false)
    private LocalDate expiryDate;
    private String unit;
    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Max(value = 10000, message = "Stock quantity cannot exceed 10000")
    private int stockQuantity; // default = 0
    private String itemType; // e.g., "Medicine", "Equipment", "Supplies"
    private String itemDescription;
}
