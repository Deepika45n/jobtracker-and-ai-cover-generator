package com.jobtracker.dto;

import jakarta.validation.constraints.NotBlank;

import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for cover letter generation.
 * Contains all fields needed by the AI providers to generate a personalized cover letter.
 * Maintains backward compatibility with the existing frontend request format.
 */
public class CoverLetterRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "Background/skills is required")
    private String background;

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Company name is required")
    private String company;

    private String location;

    private String jobDescription;

    private String tone;

    /** Quality mode: "STANDARD" (template-only) or "PROFESSIONAL" (AI-enhanced with fallback) */
    private String qualityMode = "PROFESSIONAL";

    // Default constructor
    public CoverLetterRequest() {}

    // Getters
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getBackground() { return background; }
    public String getJobTitle() { return jobTitle; }
    public String getCompany() { return company; }
    public String getLocation() { return location; }
    public String getJobDescription() { return jobDescription; }
    public String getTone() { return tone; }
    public String getQualityMode() { return qualityMode; }

    // Setters
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserName(String userName) { this.userName = userName; }
    public void setBackground(String background) { this.background = background; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public void setCompany(String company) { this.company = company; }
    public void setLocation(String location) { this.location = location; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public void setTone(String tone) { this.tone = tone; }
    public void setQualityMode(String qualityMode) { this.qualityMode = qualityMode; }
}
