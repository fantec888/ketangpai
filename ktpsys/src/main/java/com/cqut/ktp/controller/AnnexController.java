package com.cqut.ktp.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.SocketException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * @author 陈佳铭
 */
@RestController
@RequestMapping("/annex")
public class AnnexController {
    @PostMapping(value = "/upload")
    public String upload(@RequestParam MultipartFile file) throws SocketException, IOException {
        String fileId = UUID.randomUUID().toString().replace("-", "").replace("?", "").substring(0, 10);
        String originalName = Paths.get(file.getOriginalFilename()).getFileName().toString();
        String fileName = fileId + originalName;
        String uploadDir = System.getProperty("ktp.annex.dir", "../ktp2/ktp2/public/static/annex");
        Path targetDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path dest = targetDir.resolve(fileName).normalize();

        if (!dest.startsWith(targetDir)) {
            return "false";
        }

        Files.createDirectories(targetDir);
        try {
            file.transferTo(dest.toFile());
        } catch (Exception ex) {
            return "false";
        }
        return fileName;
    }
}
