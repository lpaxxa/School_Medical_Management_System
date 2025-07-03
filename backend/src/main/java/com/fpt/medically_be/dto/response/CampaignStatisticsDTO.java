package com.fpt.medically_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignStatisticsDTO {
    // Thông tin chiến dịch
    private Long campaignId;
    private String campaignTitle;
    private LocalDate startDate;
    private LocalDate endDate;

    // Thống kê tổng quan
    private Long totalStudents;          // Tổng số học sinh trong chiến dịch
    private Long notificationsSent;      // Số thông báo đã gửi
    private Long consentReceived;        // Số phụ huynh đã xác nhận
    private Long consentApproved;        // Số phụ huynh đã đồng ý
    private Long consentRejected;        // Số phụ huynh từ chối

    // Thống kê tiến độ kiểm tra
    private Long checkupsWaiting;        // Số lượt kiểm tra đang chờ
    private Long checkupsInProgress;     // Số lượt kiểm tra đang thực hiện
    private Long checkupsCompleted;      // Số lượt kiểm tra đã hoàn thành
    private Long checkupsCancelled;      // Số lượt kiểm tra đã hủy

    // Thống kê kết quả kiểm tra
    private Long normalResults;          // Số học sinh có kết quả bình thường
    private Long followUpNeeded;         // Số học sinh cần theo dõi thêm
    private Long resultsNotified;        // Số kết quả đã thông báo cho phụ huynh

    // Phân loại theo lớp
    private Map<String, Long> studentCountByClass;  // Số lượng học sinh theo lớp

    // Phân loại theo tình trạng sức khỏe
    private Map<String, Long> healthIssueCount;     // Số lượng từng vấn đề sức khỏe phát hiện

    // Tỷ lệ phần trăm để hiển thị
    private Double consentRate;          // Tỷ lệ đồng ý (%)
    private Double completionRate;       // Tỷ lệ hoàn thành (%)
    private Double followUpRate;         // Tỷ lệ cần theo dõi thêm (%)
}
