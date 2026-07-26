package com.jobtracker.service.ai;

import com.jobtracker.dto.CoverLetterRequest;
import com.jobtracker.dto.CoverLetterResponse;
import com.jobtracker.exception.AIServiceException;
import com.jobtracker.exception.RateLimitExceededException;
import com.jobtracker.model.CoverLetter;
import com.jobtracker.service.CoverLetterService;
import com.jobtracker.service.RateLimitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIRouterService {

    private static final Logger log = LoggerFactory.getLogger(AIRouterService.class);

    private final List<AIProvider> providers;
    private final CoverLetterService coverLetterService;
    private final RateLimitService rateLimitService;

    public AIRouterService(List<AIProvider> providers, CoverLetterService coverLetterService, RateLimitService rateLimitService) {
        // Sort providers by priority (lower number = higher priority)
        this.providers = providers.stream()
                .filter(AIProvider::isAvailable)
                .sorted(Comparator.comparingInt(AIProvider::getPriority))
                .collect(Collectors.toList());
        this.coverLetterService = coverLetterService;
        this.rateLimitService = rateLimitService;
        
        log.info("Initialized AIRouterService with providers: {}", 
            this.providers.stream().map(AIProvider::getProviderName).collect(Collectors.joining(", ")));
    }

    // We use a custom cache key generation
    @Cacheable(value = "coverLetterCache", key = "T(com.jobtracker.service.ai.CacheKeyGenerator).generateHash(#request.background, #request.jobDescription, #request.tone, #request.jobTitle, #request.company, #request.qualityMode)")
    public CoverLetterResponse generateCoverLetter(CoverLetterRequest request) {
        long startTime = System.currentTimeMillis();
        
        // Rate limiting check for PROFESSIONAL mode
        if ("PROFESSIONAL".equalsIgnoreCase(request.getQualityMode())) {
            if (!rateLimitService.resolveBucket(request.getUserId()).tryConsume(1)) {
                throw new RateLimitExceededException("Daily AI generation limit reached. Please use Standard mode or try again tomorrow.");
            }
        }
        
        String generatedText = null;
        String providerUsed = null;
        
        // If STANDARD mode, skip AI and go straight to template
        if ("STANDARD".equalsIgnoreCase(request.getQualityMode())) {
            AIProvider templateProvider = providers.stream()
                .filter(p -> p instanceof TemplateProvider)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Template provider not found"));
            
            try {
                generatedText = templateProvider.generate(request);
                providerUsed = templateProvider.getProviderName();
            } catch (Exception e) {
                throw new AIServiceException("Even the template provider failed", e);
            }
        } else {
            // PROFESSIONAL mode: try providers in order
            for (AIProvider provider : providers) {
                try {
                    log.info("Attempting generation with provider: {}", provider.getProviderName());
                    generatedText = provider.generate(request);
                    providerUsed = provider.getProviderName();
                    break; // Success!
                } catch (Exception e) {
                    log.error("Provider {} failed: {}", provider.getProviderName(), e.getMessage());
                    // Continue to next provider
                }
            }
            
            if (generatedText == null) {
                throw new AIServiceException("All available AI providers failed to generate a cover letter.");
            }
        }
        
        long generationTimeMs = System.currentTimeMillis() - startTime;
        
        // Save to database
        CoverLetter letter = new CoverLetter();
        letter.setUserId(request.getUserId());
        letter.setCompany(request.getCompany());
        letter.setRole(request.getJobTitle());
        letter.setExperience(request.getBackground());
        letter.setGeneratedText(generatedText);
        letter.setProviderUsed(providerUsed);
        letter.setQualityMode(request.getQualityMode());
        
        String hash = CacheKeyGenerator.generateHash(
            request.getBackground(), request.getJobDescription(), request.getTone(), request.getJobTitle(), request.getCompany(), request.getQualityMode()
        );
        letter.setPromptHash(hash);
        
        letter = coverLetterService.saveCoverLetter(letter);
        
        int remainingGenerations = rateLimitService.getRemainingTokens(request.getUserId());
        
        return new CoverLetterResponse(
            generatedText, 
            providerUsed, 
            false, // It's not cached if we reached here 
            generationTimeMs, 
            letter.getId(), 
            request.getQualityMode(), 
            remainingGenerations
        );
    }
}
