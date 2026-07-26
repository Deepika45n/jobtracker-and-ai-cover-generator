package com.jobtracker.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.CoverLetterRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Gemini AI provider implementation.
 * <p>
 * Refactored from the original {@code AICoverLetterService} Gemini logic.
 * Uses non-blocking {@link WebClient} instead of blocking {@code HttpClient}.
 * Supports model fallback chain (primary + fallback models) with retry logic.
 * </p>
 * <p>
 * Activated when {@code gemini.enabled=true} in application.properties.
 * </p>
 */
@Component
@ConditionalOnProperty(name = "gemini.enabled", havingValue = "true", matchIfMissing = true)
public class GeminiProvider implements AIProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiProvider.class);
    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final WebClient webClient;
    private final PromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash-lite}")
    private String geminiModel;

    @Value("${gemini.fallback-models:gemini-2.5-flash,gemini-2.0-flash}")
    private String fallbackModels;

    @Value("${gemini.retry.max-attempts:2}")
    private int maxRetries;

    public GeminiProvider(WebClient.Builder webClientBuilder, PromptBuilder promptBuilder) {
        this.webClient = webClientBuilder
                .baseUrl(GEMINI_API_BASE)
                .build();
        this.promptBuilder = promptBuilder;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String generate(CoverLetterRequest request) throws Exception {
        String prompt = promptBuilder.buildPrompt(request);
        String requestBody = buildGeminiRequestBody(prompt);
        RuntimeException lastError = null;

        for (String model : modelsToTry()) {
            for (int attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    log.info("[GEMINI] Trying model={}, attempt={}/{}", model, attempt + 1, maxRetries + 1);
                    String result = callGemini(model, requestBody);
                    log.info("[GEMINI] Successfully generated with model={}", model);
                    return result;
                } catch (RetryableGeminiException e) {
                    lastError = e;
                    log.warn("[GEMINI] Retryable error on model={}, attempt={}: {}",
                            model, attempt + 1, e.getMessage());
                    if (attempt < maxRetries) {
                        Thread.sleep(1000L * (attempt + 1));
                    }
                } catch (RuntimeException e) {
                    lastError = e;
                    log.warn("[GEMINI] Non-retryable error on model={}: {}", model, e.getMessage());
                    break; // Move to next model
                }
            }
        }

        throw lastError != null ? lastError
                : new RuntimeException("Failed to generate cover letter after trying all Gemini models.");
    }

    @Override
    public boolean isAvailable() {
        return geminiApiKey != null && !geminiApiKey.isBlank() && !geminiApiKey.startsWith("${");
    }

    @Override
    public String getProviderName() {
        return "Gemini";
    }

    @Override
    public int getPriority() {
        return 1; // Primary provider
    }

    /**
     * Call a specific Gemini model and return the generated text.
     */
    private String callGemini(String model, String requestBody) {
        String apiUrl = model + ":generateContent?key=" + geminiApiKey;

        String responseBody = webClient.post()
                .uri(apiUrl)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(30))
                .block();

        return parseGeminiResponse(responseBody, model);
    }

    /**
     * Parse the Gemini API response and extract the generated text.
     */
    private String parseGeminiResponse(String responseBody, String model) {
        try {
            JsonNode responseNode = objectMapper.readTree(responseBody);

            // Check for error in response
            if (responseNode.has("error")) {
                String errorMessage = responseNode.get("error").path("message").asText("Unknown error");
                int errorCode = responseNode.get("error").path("code").asInt(500);
                if (isRetryable(errorCode, errorMessage)) {
                    throw new RetryableGeminiException(
                            "Gemini API temporarily unavailable (" + model + "): " + errorMessage);
                }
                throw new RuntimeException("Gemini API error (" + model + "): " + errorMessage);
            }

            JsonNode candidates = responseNode.get("candidates");
            if (candidates == null || !candidates.isArray() || candidates.isEmpty()) {
                throw new RuntimeException("Unexpected Gemini response structure from model: " + model);
            }

            JsonNode textNode = candidates.get(0).path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new RuntimeException("No text in Gemini response from model: " + model);
            }

            return textNode.asText();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }

    /**
     * Build the ordered list of models to try (primary + fallbacks).
     */
    private List<String> modelsToTry() {
        Set<String> models = new LinkedHashSet<>();
        models.add(geminiModel.trim());
        if (fallbackModels != null && !fallbackModels.isBlank()) {
            for (String model : fallbackModels.split(",")) {
                String trimmed = model.trim();
                if (!trimmed.isEmpty()) {
                    models.add(trimmed);
                }
            }
        }
        return new ArrayList<>(models);
    }

    /**
     * Build the Gemini API request body JSON.
     */
    private String buildGeminiRequestBody(String prompt) throws Exception {
        return objectMapper.writeValueAsString(new GeminiRequest(prompt));
    }

    /**
     * Determine if an error is retryable (rate limit, overloaded, etc.).
     */
    private boolean isRetryable(int statusCode, String message) {
        if (statusCode == 429 || statusCode == 503) {
            return true;
        }
        String lower = message.toLowerCase();
        return lower.contains("high demand")
                || lower.contains("rate limit")
                || lower.contains("overloaded")
                || lower.contains("resource exhausted")
                || lower.contains("try again");
    }

    // --- Inner DTOs for Gemini API request format ---

    private static class RetryableGeminiException extends RuntimeException {
        RetryableGeminiException(String message) {
            super(message);
        }
    }

    private static class GeminiRequest {
        public Part[] contents;

        GeminiRequest(String prompt) {
            this.contents = new Part[]{new Part(prompt)};
        }

        public static class Part {
            public TextPart[] parts;

            Part(String text) {
                this.parts = new TextPart[]{new TextPart(text)};
            }
        }

        public static class TextPart {
            public String text;

            TextPart(String text) {
                this.text = text;
            }
        }
    }
}
