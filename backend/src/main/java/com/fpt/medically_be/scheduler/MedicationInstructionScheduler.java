package com.fpt.medically_be.scheduler;

import com.fpt.medically_be.service.MedicationInstructionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MedicationInstructionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(MedicationInstructionScheduler.class);

    private final MedicationInstructionService medicationInstructionService;

    @Autowired
    public MedicationInstructionScheduler(MedicationInstructionService medicationInstructionService) {
        this.medicationInstructionService = medicationInstructionService;
    }

    /**
     * Scheduled task to update expired medication instructions
     * Runs daily at 1:00 AM
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void updateExpiredMedicationInstructions() {
        logger.info("Running scheduled task to update expired medication instructions");
        int updatedCount = medicationInstructionService.updateExpiredMedicationInstructions();
        logger.info("Updated {} expired medication instructions", updatedCount);
    }
}
