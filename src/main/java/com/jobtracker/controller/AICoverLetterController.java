package com.jobtracker.controller;

import com.jobtracker.dto.CoverLetterHistoryResponse;
import com.jobtracker.dto.CoverLetterRequest;
import com.jobtracker.dto.CoverLetterResponse;
import com.jobtracker.model.CoverLetter;
import com.jobtracker.service.CoverLetterService;
import com.jobtracker.service.RateLimitService;
import com.jobtracker.service.ai.AIRouterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai/cover-letter")
public class AICoverLetterController {

    private final AIRouterService aiRouterService;
    private final CoverLetterService coverLetterService;
    private final RateLimitService rateLimitService;

    public AICoverLetterController(AIRouterService aiRouterService, CoverLetterService coverLetterService, RateLimitService rateLimitService) {
        this.aiRouterService = aiRouterService;
        this.coverLetterService = coverLetterService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/generate")
    public ResponseEntity<CoverLetterResponse> generateCoverLetter(@Valid @RequestBody CoverLetterRequest request) {
        // Defaults if missing
        if (request.getQualityMode() == null) {
            request.setQualityMode("PROFESSIONAL");
        }
        
        CoverLetterResponse response = aiRouterService.generateCoverLetter(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<CoverLetterHistoryResponse>> getHistory(@PathVariable Long userId) {
        List<CoverLetterHistoryResponse> history = coverLetterService.getUserCoverLetters(userId).stream()
            .map(cl -> new CoverLetterHistoryResponse(
                cl.getId(),
                cl.getCompany(),
                cl.getRole(),
                cl.getGeneratedText().length() > 100 ? cl.getGeneratedText().substring(0, 100) + "..." : cl.getGeneratedText(),
                cl.getProviderUsed(),
                cl.getQualityMode(),
                cl.getCreatedAt()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoverLetter> getCoverLetter(@PathVariable Long id) {
        return ResponseEntity.ok(coverLetterService.getCoverLetter(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoverLetter> updateCoverLetter(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        String newText = payload.get("generatedText");
        return ResponseEntity.ok(coverLetterService.updateCoverLetterText(id, newText));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoverLetter(@PathVariable Long id) {
        coverLetterService.deleteCoverLetter(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<CoverLetter> duplicateCoverLetter(@PathVariable Long id) {
        return ResponseEntity.ok(coverLetterService.duplicateCoverLetter(id));
    }

    @GetMapping("/remaining/{userId}")
    public ResponseEntity<java.util.Map<String, Integer>> getRemainingGenerations(@PathVariable Long userId) {
        int remaining = rateLimitService.getRemainingTokens(userId);
        return ResponseEntity.ok(java.util.Map.of("remaining", remaining));
    }
}
