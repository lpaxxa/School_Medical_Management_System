package com.fpt.medically_be.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Ngoại lệ được ném ra khi không tìm thấy tài nguyên được yêu cầu.
 * Ví dụ: Không tìm thấy bài viết sức khỏe, bài đăng cộng đồng, bình luận...
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Khởi tạo ngoại lệ với thông báo lỗi
     *
     * @param message Thông báo lỗi
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Khởi tạo ngoại lệ với thông báo lỗi và nguyên nhân
     *
     * @param message Thông báo lỗi
     * @param cause Nguyên nhân gây ra ngoại lệ
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
