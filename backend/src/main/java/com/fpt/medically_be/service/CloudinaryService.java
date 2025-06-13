package com.fpt.medically_be.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    Map upload(MultipartFile file) throws IOException;
    Map destroy(String publicId) throws IOException;
    String createUrl(String publicId);
}
