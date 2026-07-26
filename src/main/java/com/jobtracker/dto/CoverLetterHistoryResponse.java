package com.jobtracker.dto;

import java.time.LocalDateTime;

public class CoverLetterHistoryResponse {
    private Long id;
    private String company;
    private String role;
    private String generatedTextPreview;
    private String providerUsed;
    private String qualityMode;
    private LocalDateTime createdAt;

    public CoverLetterHistoryResponse() {}

    public CoverLetterHistoryResponse(Long id, String company, String role, String generatedTextPreview, String providerUsed, String qualityMode, LocalDateTime createdAt) {
        this.id = id;
        this.company = company;
        this.role = role;
        this.generatedTextPreview = generatedTextPreview;
        this.providerUsed = providerUsed;
        this.qualityMode = qualityMode;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getGeneratedTextPreview() {
        return generatedTextPreview;
    }

    public void setGeneratedTextPreview(String generatedTextPreview) {
        this.generatedTextPreview = generatedTextPreview;
    }

    public String getProviderUsed() {
        return providerUsed;
    }

    public void setProviderUsed(String providerUsed) {
        this.providerUsed = providerUsed;
    }

    public String getQualityMode() {
        return qualityMode;
    }

    public void setQualityMode(String qualityMode) {
        this.qualityMode = qualityMode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
