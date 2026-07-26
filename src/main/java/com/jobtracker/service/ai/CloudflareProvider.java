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
 * Cloudflare Workers AI provider implementation.
 */
@Component
@ConditionalOnProperty(name = "cloudflare.enabled", havingValue = "true")
public class CloudflareProvider implements AIProvider {

    private static final Logger log = LoggerFactory.getLogger(CloudflareProvider.class);

    private final WebClient webClient;
    private final PromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    @Value("${cloudflare.account.id:}")
    private String accountId;

    @Value("${cloudflare.api.token:}")
    private String apiToken;

    @Value("${cloudflare.model:@cf/meta/llama-3.1-8b-instruct}")
    private String model;

    @Value("${cloudflare.retry.max-attempts:2}")
    private int maxRetries;

    public CloudflareProvider(WebClient.Builder webClientBuilder, PromptBuilder promptBuilder) {
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
                log.info("[CLOUDFLARE] Trying attempt={}/{}", attempt + 1, maxRetries + 1);
                String result = callCloudflare(requestBody);
                log.info("[CLOUDFLARE] Successfully generated");
                return result;
            } catch (Exception e) {
                lastError = new RuntimeException(e);
                log.warn("[CLOUDFLARE] Error attempt={}: {}", attempt + 1, e.getMessage());
                if (attempt < maxRetries) {
                    Thread.sleep(1000L * (attempt + 1));
                }
            }
        }

        throw lastError != null ? lastError : new RuntimeException("Failed to generate with Cloudflare");
    }

    @Override
    public boolean isAvailable() {
        return accountId != null && !accountId.isBlank() && !accountId.startsWith("${") &&
               apiToken != null && !apiToken.isBlank() && !apiToken.startsWith("${");
    }

    @Override
    public String getProviderName() {
        return "Cloudflare AI";
    }

    @Override
    public int getPriority() {
        return 3;
    }

    private String callCloudflare(String requestBody) {
        String apiUrl = String.format("https://api.cloudflare.com/client/v4/accounts/%s/ai/run/%s", accountId, model);

        String responseBody = webClient.post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiToken)
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
            
            if (!responseNode.path("success").asBoolean(false)) {
                JsonNode err = responseNode.path("errors");
                throw new RuntimeException("Cloudflare API error: " + (err.isArray() && err.size() > 0 ? err.get(0).path("message").asText() : "Unknown"));
            }

            JsonNode result = responseNode.get("result");
            if (result == null || !result.has("response")) {
                throw new RuntimeException("Unexpected response structure");
            }

            return result.get("response").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse response: " + e.getMessage(), e);
        }
    }

    private String buildRequestBody(String prompt) throws Exception {
        return String.format("""
            {
              "messages": [
                {"role": "user", "content": %s}
              ]
            }
            """, objectMapper.writeValueAsString(prompt));
    }
}
