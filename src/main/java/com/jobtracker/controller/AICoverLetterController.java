package com.jobtracker.controller;

import com.jobtracker.service.AICoverLetterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/cover-letter")
public class AICoverLetterController {

    private final AICoverLetterService aiCoverLetterService;

    public AICoverLetterController(AICoverLetterService aiCoverLetterService) {
        this.aiCoverLetterService = aiCoverLetterService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateCoverLetter(@RequestBody CoverLetterRequest request) {
        try {
            String coverLetter = aiCoverLetterService.generateCoverLetter(
                request.getUserName(),
                request.getBackground(),
                request.getJobTitle(),
                request.getCompany(),
                request.getLocation(),
                request.getJobDescription(),
                request.getTone()
            );
            return ResponseEntity.ok(new CoverLetterResponse(coverLetter));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(500)
                .body(new ErrorResponse("API configuration error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Failed to generate cover letter: " + e.getMessage()));
        }
    }

    // Request/Response DTOs
    public static class CoverLetterRequest {
        private String userName;
        private String background;
        private String jobTitle;
        private String company;
        private String location;
        private String jobDescription;
        private String tone;

        // Getters and setters
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getBackground() { return background; }
        public void setBackground(String background) { this.background = background; }
        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getJobDescription() { return jobDescription; }
        public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
        public String getTone() { return tone; }
        public void setTone(String tone) { this.tone = tone; }
    }

    public static class CoverLetterResponse {
        private String coverLetter;

        public CoverLetterResponse(String coverLetter) {
            this.coverLetter = coverLetter;
        }

        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    }

    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
}
