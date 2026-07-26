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

import java.time.Duration;

/**
 * OpenRouter AI provider implementation.
 * <p>
 * Activated when {@code openrouter.enabled=true} in application.properties.
 * </p>
 */
@Component
@ConditionalOnProperty(name = "openrouter.enabled", havingValue = "true")
public class OpenRouterProvider implements AIProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenRouterProvider.class);
    private static final String OPENROUTER_API_BASE = "https://openrouter.ai/api/v1/chat/completions";

    private final WebClient webClient;
    private final PromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    @Value("${openrouter.api.key:}")
    private String apiKey;

    @Value("${openrouter.model:meta-llama/llama-3.1-8b-instruct:free}")
    private String model;

    @Value("${openrouter.retry.max-attempts:2}")
    private int maxRetries;

    public OpenRouterProvider(WebClient.Builder webClientBuilder, PromptBuilder promptBuilder) {
        this.webClient = webClientBuilder.build();
        this.promptBuilder = promptBuilder;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String generate(CoverLetterRequest request) throws Exception {
        String prompt = promptBuilder.buildPrompt(request);
        String requestBody = buildRequestBody(prompt);
        RuntimeException lastError = null;

        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                log.info("[OPENROUTER] Trying attempt={}/{}", attempt + 1, maxRetries + 1);
                String result = callOpenRouter(requestBody);
                log.info("[OPENROUTER] Successfully generated");
                return result;
            } catch (RetryableException e) {
                lastError = e;
                log.warn("[OPENROUTER] Retryable error attempt={}: {}", attempt + 1, e.getMessage());
                if (attempt < maxRetries) {
                    Thread.sleep(1000L * (attempt + 1));
                }
            } catch (RuntimeException e) {
                lastError = e;
                log.warn("[OPENROUTER] Non-retryable error: {}", e.getMessage());
                break;
            }
        }

        throw lastError != null ? lastError : new RuntimeException("Failed to generate with OpenRouter");
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.startsWith("${");
    }

    @Override
    public String getProviderName() {
        return "OpenRouter";
    }

    @Override
    public int getPriority() {
        return 2;
    }

    private String callOpenRouter(String requestBody) {
        String responseBody = webClient.post()
                .uri(OPENROUTER_API_BASE)
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "https://jobtrackai.com") // Recommended by OpenRouter
                .header("X-Title", "JobTrack AI") // Recommended by OpenRouter
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(30))
                .block();

        return parseResponse(responseBody);
    }

    private String parseResponse(String responseBody) {
        try {
            JsonNode responseNode = objectMapper.readTree(responseBody);
            
            if (responseNode.has("error")) {
                JsonNode err = responseNode.get("error");
                String msg = err.has("message") ? err.get("message").asText() : "Unknown error";
                throw new RuntimeException("OpenRouter API error: " + msg);
            }

            JsonNode choices = responseNode.get("choices");
            if (choices == null || !choices.isArray() || choices.isEmpty()) {
                throw new RuntimeException("Unexpected response structure");
            }

            JsonNode content = choices.get(0).path("message").path("content");
            if (content.isMissingNode() || content.isNull()) {
                throw new RuntimeException("No text in response");
            }

            return content.asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse response: " + e.getMessage(), e);
        }
    }

    private String buildRequestBody(String prompt) throws Exception {
        return String.format("""
            {
              "model": "%s",
              "messages": [
                {"role": "user", "content": %s}
              ]
            }
            """, model, objectMapper.writeValueAsString(prompt));
    }

    private static class RetryableException extends RuntimeException {
        RetryableException(String message) {
            super(message);
        }
    }
}
