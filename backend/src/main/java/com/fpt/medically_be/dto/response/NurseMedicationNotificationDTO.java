package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.base.BaseMapper;
import com.fpt.medically_be.entity.MedicationInstruction;
import lombok.*;

import java.util.logging.Logger;
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NurseMedicationNotificationDTO extends BaseMapper<MedicationInstruction, NurseMedicationNotificationDTO> {
    private static final Logger logger = Logger.getLogger(NurseMedicationNotificationDTO.class.getName());
    private Long Id;
    private String medicationName;
    private String dosage;
    private String frequency;
    private String specialInstructions;
    private String submittedDate;
    private String timeOfDay;

    @Override
    public NurseMedicationNotificationDTO toObject(MedicationInstruction entity) {
        if (entity == null) {
            return null;
        }
        NurseMedicationNotificationDTO dto = new NurseMedicationNotificationDTO();
        dto.setId(entity.getId());
        dto.setMedicationName(entity.getMedicationName());
        dto.setDosage(entity.getDosageInstructions());
        dto.setFrequency(entity.getFrequencyPerDay());
        dto.setSpecialInstructions(entity.getSpecialInstructions());
        dto.setTimeOfDay(entity.getTimeOfDay());
        dto.setSubmittedDate(entity.getSubmittedAt() != null ? entity.getSubmittedAt().toString() : null);
        return dto;
    }

    @Override
    public MedicationInstruction toEntity(NurseMedicationNotificationDTO dto) {
        if (dto == null) {
            return null;
        }
        MedicationInstruction entity = new MedicationInstruction();
        entity.setId(dto.getId());
        entity.setMedicationName(dto.getMedicationName());
        entity.setDosageInstructions(dto.getDosage());
        entity.setFrequencyPerDay(dto.getFrequency());
        entity.setSpecialInstructions(dto.getSpecialInstructions());
        entity.setTimeOfDay(dto.getTimeOfDay());
        return entity;
    }
}
