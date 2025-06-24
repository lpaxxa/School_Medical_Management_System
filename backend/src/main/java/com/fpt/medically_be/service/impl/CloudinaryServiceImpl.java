package com.fpt.medically_be.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fpt.medically_be.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file) throws IOException {
        // Tạo một public_id ngẫu nhiên cho ảnh
        String publicId = "health_article_" + UUID.randomUUID().toString();

        // Upload ảnh lên Cloudinary
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "health_articles",
                "resource_type", "auto"
            )
        );

        // Trả về secure URL của ảnh đã upload
        return (String) uploadResult.get("secure_url");
    }

    @Override
    public String uploadImage(MultipartFile file, Long articleId) throws IOException {
        // Tạo public_id có chứa ID bài viết
        String publicId = "health_article_" + articleId + "_" + UUID.randomUUID().toString();

        // Upload ảnh lên Cloudinary với thư mục dựa trên ID bài viết
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "health_articles/" + articleId,
                "resource_type", "auto"
            )
        );

        // Trả về secure URL của ảnh đã upload
        return (String) uploadResult.get("secure_url");
    }

    @Override
    public String uploadMedicationConfirmImage(MultipartFile file, Long medicationAdminId) throws IOException {
        // Tạo public_id có chứa ID của lần cho uống thuốc
        String publicId = "medication_confirmation_" + medicationAdminId + "_" + UUID.randomUUID().toString();

        // Upload ảnh lên Cloudinary với thư mục medication_confirmations
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "medication_confirmations/" + medicationAdminId,
                "resource_type", "auto"
            )
        );

        // Trả về secure URL của ảnh đã upload
        return (String) uploadResult.get("secure_url");
    }

    @Override
    public Map<?, ?> deleteImage(String publicId) throws IOException {
        // Xóa ảnh từ Cloudinary theo public_id
        return cloudinary.uploader().destroy(
            publicId,
            ObjectUtils.emptyMap()
        );
    }

    @Override
    public Map<?, ?> destroy(String publicId) throws IOException {
        // Gọi đến phương thức deleteImage để xử lý logic xóa
        return deleteImage(publicId);
    }

    @Override
    public Map<?, ?> upload(MultipartFile file) throws IOException {
        // Upload ảnh và trả về toàn bộ thông tin kết quả
        return cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.emptyMap()
        );
    }

    @Override
    public Map<?, ?> upload(MultipartFile file, Long articleId) throws IOException {
        // Tạo public_id có chứa ID bài viết
        String publicId = "health_article_" + articleId + "_" + UUID.randomUUID().toString();

        // Upload ảnh và trả về toàn bộ thông tin kết quả với thư mục dựa trên ID bài viết
        return cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "health_articles/" + articleId,
                "resource_type", "auto"
            )
        );
    }
}
