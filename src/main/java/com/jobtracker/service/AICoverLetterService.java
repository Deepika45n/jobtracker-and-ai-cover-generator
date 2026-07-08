package com.jobtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class AICoverLetterService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash-lite}")
    private String geminiModel;

    @Value("${gemini.fallback-models:gemini-2.5-flash,gemini-2.0-flash}")
    private String fallbackModels;

    @Value("${gemini.retry.max-attempts:2}")
    private int maxRetries;

    private static final String GEMINI_API_BASE =
        "https://generativelanguage.googleapis.com/v1beta/models/";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateCoverLetter(String userName, String background, String jobTitle,
                                     String company, String location, String jobDescription,
                                     String tone) throws Exception {

        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.startsWith("${")) {
            throw new IllegalStateException(
                "Gemini API key not configured. Set the GEMINI_API_KEY environment variable.");
        }

        String prompt = String.format("""
            Write a %s cover letter for:

Applicant: %s
Background & Skills: %s

Job Title: %s
Company: %s
Location: %s
Job Description: %s

Instructions:
- Write 3-4 focused paragraphs
- Address "The Hiring Team" at %s
- Highlight most relevant skills from the background
- Be specific about why they want THIS company
- Professional closing, sign as %s
- Do NOT add placeholder contact info like [Your Phone Number]""",
            tone, userName, background, jobTitle, company,
            location != null ? location : "Not specified",
            jobDescription != null ? jobDescription : "Not specified",
            company, userName);

        String requestBody = objectMapper.writeValueAsString(new GeminiRequest(prompt));
        RuntimeException lastError = null;

        for (String model : modelsToTry()) {
            for (int attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    return callGemini(model, requestBody);
                } catch (RetryableGeminiException e) {
                    lastError = e;
                    if (attempt < maxRetries) {
                        Thread.sleep(1000L * (attempt + 1));
                    }
                } catch (RuntimeException e) {
                    lastError = e;
                    break;
                }
            }
        }

        if (lastError != null) {
            throw lastError;
        }
        throw new RuntimeException("Failed to generate cover letter after trying all Gemini models.");
    }

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

    private String callGemini(String model, String requestBody) throws Exception {
        String apiUrl = GEMINI_API_BASE + model + ":generateContent?key=" + geminiApiKey;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(apiUrl))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            String errorMessage = extractErrorMessage(response.body());
            if (isRetryable(response.statusCode(), errorMessage)) {
                throw new RetryableGeminiException(
                    "Gemini API temporarily unavailable (" + model + "): " + errorMessage);
            }
            throw new RuntimeException("Gemini API error (" + model + "): " + errorMessage);
        }

        JsonNode responseNode = objectMapper.readTree(response.body());
        JsonNode candidates = responseNode.get("candidates");
        if (candidates == null || !candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Unexpected API response structure: " + response.body());
        }

        JsonNode textNode = candidates.get(0).path("content").path("parts").path(0).path("text");
        if (textNode.isMissingNode() || textNode.isNull()) {
            throw new RuntimeException("Unexpected API response structure: " + response.body());
        }

        return textNode.asText();
    }

    private String extractErrorMessage(String body) {
        try {
            JsonNode errorNode = objectMapper.readTree(body);
            if (errorNode.has("error")) {
                return errorNode.get("error").get("message").asText();
            }
        } catch (Exception ignored) {
            // fall through to generic message
        }
        return "Unknown error from Gemini API";
    }

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
