package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class MedicationUsedDTO {

   @Min(value = 1, message = "Item ID must be greater than 0")
   @Max(value = 50000, message = "Item ID cannot exceed 50000")
   private int itemID;
   @Min(value = 0, message = "Quantity used must be greater than 0")
    @Max(value = 10000, message = "Quantity used cannot exceed 10000")
   private int quantityUsed;

}
