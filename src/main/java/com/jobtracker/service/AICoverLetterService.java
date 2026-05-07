package com.jobtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class AICoverLetterService {

    @Value("${anthropic.api.key}")
    private String anthropicApiKey;

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 1200;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateCoverLetter(String userName, String background, String jobTitle, 
                                     String company, String location, String jobDescription, 
                                     String tone) throws Exception {
        
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            throw new IllegalStateException("Anthropic API key not configured");
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

        String requestBody = objectMapper.writeValueAsString(new MessageRequest(MODEL, MAX_TOKENS, prompt));

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(ANTHROPIC_API_URL))
            .header("Content-Type", "application/json")
            .header("x-api-key", anthropicApiKey)
            .header("anthropic-version", "2023-06-01")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            JsonNode errorNode = objectMapper.readTree(response.body());
            String errorMessage = errorNode.has("error") ? 
                errorNode.get("error").get("message").asText() : 
                "Unknown error from Anthropic API";
            throw new RuntimeException("Anthropic API error: " + errorMessage);
        }

        JsonNode responseNode = objectMapper.readTree(response.body());
        return responseNode.get("content").get(0).get("text").asText();
    }

    // Inner class for JSON serialization
    private static class MessageRequest {
        public String model;
        public int max_tokens;
        public Message[] messages;

        MessageRequest(String model, int maxTokens, String prompt) {
            this.model = model;
            this.max_tokens = maxTokens;
            this.messages = new Message[]{new Message("user", prompt)};
        }

        public static class Message {
            public String role;
            public String content;

            Message(String role, String content) {
                this.role = role;
                this.content = content;
            }
        }
    }
}
