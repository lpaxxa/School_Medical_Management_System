package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.base.BaseMapper;
import com.fpt.medically_be.entity.MedicationInstruction;
import com.fpt.medically_be.entity.Status;
import lombok.*;

import java.time.LocalDateTime;
import java.util.logging.Logger;
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentMedicationResponseNotification extends BaseMapper<MedicationInstruction,ParentMedicationResponseNotification> {
    private static final Logger logger = Logger.getLogger(ParentMedicationResponseNotification.class.getName());
    private Long Id;
    private String medicationName;
    private String dosage;
    private Integer frequency;
    private String specialInstructions;
    private String responseDate;
    private Status status;

    @Override
    public ParentMedicationResponseNotification toObject(MedicationInstruction entity) {
        if (entity == null) {
            return null;
        }
        ParentMedicationResponseNotification response = new ParentMedicationResponseNotification();
        response.setId(entity.getId());
        response.setMedicationName(entity.getMedicationName());
        response.setDosage(entity.getDosageInstructions());
        response.setFrequency(entity.getFrequencyPerDay());
        response.setSpecialInstructions(entity.getSpecialInstructions());
        response.setResponseDate(entity.getResponseDate() != null ? entity.getResponseDate().toString() : null);
        response.setStatus(entity.getStatus());
        return response;
    }
    @Override
    public MedicationInstruction toEntity(ParentMedicationResponseNotification dto) {
        if (dto == null) {
            return null;
        }
        MedicationInstruction entity = new MedicationInstruction();
        entity.setId(dto.getId());
        entity.setMedicationName(dto.getMedicationName());
        entity.setDosageInstructions(dto.getDosage());
        entity.setFrequencyPerDay(dto.getFrequency());
        entity.setSpecialInstructions(dto.getSpecialInstructions());
        // Assuming responseDate is in ISO format
        entity.setResponseDate(dto.getResponseDate() != null ? LocalDateTime.parse(dto.getResponseDate()) : null);
        entity.setStatus(dto.getStatus());
        return entity;
    }
}
