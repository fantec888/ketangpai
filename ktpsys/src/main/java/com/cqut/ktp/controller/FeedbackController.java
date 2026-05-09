package com.cqut.ktp.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {
    @PostMapping(value = "/submit")
    public Boolean submit(@RequestBody Map<String, Object> feedback) {
        try {
            Path path = Paths.get(System.getProperty("ktp.feedback.file", "feedback.log"))
                    .toAbsolutePath()
                    .normalize();
            if (path.getParent() != null) {
                Files.createDirectories(path.getParent());
            }
            String line = LocalDateTime.now() + "\t"
                    + value(feedback, "userId") + "\t"
                    + value(feedback, "name") + "\t"
                    + value(feedback, "type") + "\t"
                    + value(feedback, "title") + "\t"
                    + value(feedback, "content").replace("\r", " ").replace("\n", " ")
                    + System.lineSeparator();
            Files.write(path, line.getBytes(StandardCharsets.UTF_8),
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    private String value(Map<String, Object> source, String key) {
        Object value = source.get(key);
        return value == null ? "" : String.valueOf(value);
    }
}
