package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.MedicalCheckupCreateRequestDTO;
import com.fpt.medically_be.entity.SpecialCheckupType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

public class MedicalCheckupControllerIntegrationTest {

    @Test
    public void testMedicalCheckupCreateRequestDTO() {
        // Simple test to verify DTO creation works
        MedicalCheckupCreateRequestDTO request = MedicalCheckupCreateRequestDTO.builder()
                .healthCampaignId(1L)
                .checkupType("Khám tổng quát")
                .checkupDate(LocalDate.now().plusDays(7))
                .notes("Khám sức khỏe định kỳ")
                .studentIds(Arrays.asList(1L, 2L, 3L))
                .specialCheckupItems(Arrays.asList(SpecialCheckupType.BLOOD_TEST, SpecialCheckupType.DENTAL_EXAMINATION))
                .createdByNurseId(1L)
                .autoNotifyParents(true)
                .build();

        assertNotNull(request);
        assertEquals("Khám tổng quát", request.getCheckupType());
        assertEquals(3, request.getStudentIds().size());
        assertEquals(2, request.getSpecialCheckupItems().size());
        assertTrue(request.getAutoNotifyParents());
    }
}