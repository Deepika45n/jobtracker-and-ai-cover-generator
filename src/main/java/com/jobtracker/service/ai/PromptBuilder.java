package com.jobtracker.service.ai;

import com.jobtracker.dto.CoverLetterRequest;
import org.springframework.stereotype.Component;

/**
 * Builds optimized AI prompts from cover letter request data.
 * <p>
 * Centralizes prompt construction so all AI providers (Gemini, OpenRouter)
 * share the same prompt format. This ensures consistent output quality
 * regardless of which provider handles the request.
 * </p>
 */
@Component
public class PromptBuilder {

    /**
     * Build a structured prompt for AI-based cover letter generation.
     *
     * @param request the cover letter request
     * @return formatted prompt string optimized for LLM consumption
     */
    public String buildPrompt(CoverLetterRequest request) {
        String location = request.getLocation() != null && !request.getLocation().isBlank()
                ? request.getLocation() : "Not specified";
        String jobDescription = request.getJobDescription() != null && !request.getJobDescription().isBlank()
                ? request.getJobDescription() : "Not specified";
        String tone = request.getTone() != null && !request.getTone().isBlank()
                ? request.getTone() : "Professional";

        return String.format("""
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
                - Match the tone: %s
                - Professional closing, sign as %s
                - Do NOT add placeholder contact info like [Your Phone Number]
                - Do NOT include a subject line or email headers
                - Start directly with the salutation""",
                tone,
                request.getUserName(),
                request.getBackground(),
                request.getJobTitle(),
                request.getCompany(),
                location,
                jobDescription,
                request.getCompany(),
                tone,
                request.getUserName()
        );
    }

    /**
     * Build a prompt that asks the AI to enhance a template-generated cover letter.
     * This is used in hybrid mode to guarantee a result (template) but make it sound human (AI).
     */
    public String buildEnhancementPrompt(String templateLetter, CoverLetterRequest request) {
        String tone = request.getTone() != null && !request.getTone().isBlank()
                ? request.getTone() : "Professional";
                
        return String.format("""
                I have drafted a basic cover letter using a template. 
                Please rewrite it to make it flow naturally, sound human, and match a %s tone.
                
                Guidelines:
                - Do NOT change the core facts or skills mentioned.
                - Do NOT add made-up experience.
                - Keep the length to 3-4 paragraphs.
                - Do NOT add placeholder contact info like [Your Phone Number].
                - Do NOT include a subject line or email headers.
                - Start directly with the salutation.
                
                Here is the draft to enhance:
                
                %s
                """, tone, templateLetter);
    }
}
