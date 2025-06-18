package com.cityfix.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageService {
    private static final String UPLOAD_DIR = "uploads/";

    public String uploadFileAndGetUrl(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            // Ensure uploads/ directory exists
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Build full file path
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR, fileName);

            // Save file
            Files.write(filePath, file.getBytes());

            // Return path (could later be a URL)
            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }
}
