package com.fpt.medically_be.dto.request;

import com.fpt.medically_be.entity.ConsentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentConsentRequestDTO {
//    // Thông tin xác nhận
//    private Boolean consentGiven;
//
//    // Các mục kiểm tra đặc biệt được đồng ý
//    private List<String> specialCheckupItems;
//
//    // Ghi chú của phụ huynh
//    private String parentNotes;

    @Schema(
            description = "Trạng thái đồng ý của phụ huynh",
            example = "APPROVED",
            allowableValues = {"PENDING", "APPROVED", "REJECTED"}
    )
    private ConsentStatus consentStatus;

    @Schema(
            description = "Danh sách các mục kiểm tra đặc biệt phụ huynh đồng ý",
            example = "[\"Thị lực\", \"Tim mạch\"]",
            allowableValues = {"Thị lực", "Tim mạch", "Tâm lý", "Tai - Mũi - Họng", "Dị ứng"}
    )
    private List<String> specialCheckupItems;

    @Schema(
            description = "Ghi chú riêng của phụ huynh",
            example = "Con tôi bị dị ứng nhẹ"
    )
    private String parentNotes;
}
