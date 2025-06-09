package com.fpt.medically_be.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fpt.medically_be.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public Map upload(MultipartFile file) throws IOException {
        // Tạo public_id độc nhất cho file
        String publicId = "student_images/" + UUID.randomUUID().toString();

        return cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "student_images",
                "resource_type", "auto"
            )
        );
    }

    @Override
    public Map destroy(String publicId) throws IOException {
        return cloudinary.uploader().destroy(
            publicId,
            ObjectUtils.emptyMap()
        );
    }

    @Override
    public String createUrl(String publicId) {
        // Tạo URL cho ảnh sử dụng API của Cloudinary
        return cloudinary.url()
            .secure(true)  // Sử dụng HTTPS
            .publicId(publicId)
            .format("auto")  // Tự động chọn định dạng phù hợp
            .generate();
    }
}
