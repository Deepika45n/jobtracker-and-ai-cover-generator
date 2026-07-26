package com.jobtracker.dto;

/**
 * Response DTO for cover letter generation.
 * The {@code coverLetter} field is backward-compatible with the existing frontend.
 * Additional metadata fields (provider, cached, generationTimeMs) provide
 * observability without breaking the existing contract.
 */
public class CoverLetterResponse {

    private String coverLetter;
    private String provider;
    private boolean cached;
    private long generationTimeMs;
    
    private Long id;
    private String qualityMode;
    private int remainingAiGenerations;

    public CoverLetterResponse() {}

    public CoverLetterResponse(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public CoverLetterResponse(String coverLetter, String provider, boolean cached, long generationTimeMs, Long id, String qualityMode, int remainingAiGenerations) {
        this.coverLetter = coverLetter;
        this.provider = provider;
        this.cached = cached;
        this.generationTimeMs = generationTimeMs;
        this.id = id;
        this.qualityMode = qualityMode;
        this.remainingAiGenerations = remainingAiGenerations;
    }

    // Getters
    public String getCoverLetter() { return coverLetter; }
    public String getProvider() { return provider; }
    public boolean isCached() { return cached; }
    public long getGenerationTimeMs() { return generationTimeMs; }
    public Long getId() { return id; }
    public String getQualityMode() { return qualityMode; }
    public int getRemainingAiGenerations() { return remainingAiGenerations; }

    // Setters
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public void setProvider(String provider) { this.provider = provider; }
    public void setCached(boolean cached) { this.cached = cached; }
    public void setGenerationTimeMs(long generationTimeMs) { this.generationTimeMs = generationTimeMs; }
    public void setId(Long id) { this.id = id; }
    public void setQualityMode(String qualityMode) { this.qualityMode = qualityMode; }
    public void setRemainingAiGenerations(int remainingAiGenerations) { this.remainingAiGenerations = remainingAiGenerations; }
}
