package com.fpt.medically_be.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    /**
     * Tải lên một file ảnh lên Cloudinary
     *
     * @param file File ảnh cần upload
     * @return URL của ảnh đã upload
     * @throws IOException nếu có lỗi khi xử lý file
     */
    String uploadImage(MultipartFile file) throws IOException;

    /**
     * Tải lên một file ảnh lên Cloudinary và liên kết với một bài viết cụ thể
     *
     * @param file File ảnh cần upload
     * @param articleId ID của bài viết liên quan đến ảnh
     * @return URL của ảnh đã upload
     * @throws IOException nếu có lỗi khi xử lý file
     */
    String uploadImage(MultipartFile file, Long articleId) throws IOException;

    /**
     * Tải lên một file ảnh xác nhận cho thuốc lên Cloudinary
     *
     * @param file File ảnh cần upload
     * @param medicationAdminId ID của lần cho uống thuốc
     * @return URL của ảnh đã upload
     * @throws IOException nếu có lỗi khi xử lý file
     */
    String uploadMedicationConfirmImage(MultipartFile file, Long medicationAdminId) throws IOException;

    /**
     * Xóa một ảnh từ Cloudinary
     *
     * @param publicId public ID của ảnh cần xóa
     * @return Kết quả xóa
     * @throws IOException nếu có lỗi khi xóa ảnh
     */
    Map<?, ?> deleteImage(String publicId) throws IOException;

    /**
     * Phương thức alias cho deleteImage, để tương thích với code hiện tại
     *
     * @param publicId public ID của ảnh cần xóa
     * @return Kết quả xóa
     * @throws IOException nếu có lỗi khi xóa ảnh
     */
    Map<?, ?> destroy(String publicId) throws IOException;

    /**
     * Phương thức alias cho uploadImage, để tương thích với code hiện tại
     *
     * @param file File ảnh cần upload
     * @return Thông tin về ảnh đã upload bao gồm URL, public_id, và các thông tin khác
     * @throws IOException nếu có lỗi khi xử lý file
     */
    Map<?, ?> upload(MultipartFile file) throws IOException;

    /**
     * Phương thức alias cho uploadImage với articleId, để tương thích với code hiện tại
     *
     * @param file File ảnh cần upload
     * @param articleId ID của bài viết liên quan đến ảnh
     * @return Thông tin về ảnh đã upload bao gồm URL, public_id, và các thông tin khác
     * @throws IOException nếu có lỗi khi xử lý file
     */
    Map<?, ?> upload(MultipartFile file, Long articleId) throws IOException;
}
