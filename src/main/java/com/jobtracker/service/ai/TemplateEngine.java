package com.jobtracker.service.ai;

import com.jobtracker.dto.CoverLetterRequest;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class TemplateEngine {

    // A few basic templates to guarantee a result even without AI
    private static final String[] INTROS = {
        "Dear Hiring Manager,\n\nI am writing to express my strong interest in the %s position at %s. With my background in %s, I am confident in my ability to contribute effectively to your team.",
        "To the %s Hiring Team,\n\nI am thrilled to apply for the %s role. My experience in %s has prepared me well for the challenges and opportunities this position presents.",
        "Dear Hiring Committee,\n\nPlease accept this letter as an expression of my interest in the %s role at %s. I have developed a strong skill set in %s that aligns well with your needs."
    };

    private static final String[] BODIES = {
        "\n\nIn my previous roles, I have consistently demonstrated a strong ability to deliver results. The job description mentions a need for %s, and I have a proven track record in this area.",
        "\n\nI was particularly drawn to this opportunity because of your company's innovative approach. My skills align perfectly with the requirements, specifically in %s.",
        "\n\nThroughout my career, I have focused on continuous improvement and excellence. I am excited about the prospect of bringing my expertise in %s to your esteemed organization."
    };

    private static final String[] CLOSINGS = {
        "\n\nThank you for considering my application. I look forward to the possibility of discussing this exciting opportunity with you.\n\nSincerely,\n%s",
        "\n\nI am eager to learn more about how I can contribute to your team's success. Thank you for your time and consideration.\n\nBest regards,\n%s",
        "\n\nI would welcome the chance to discuss how my background meets your needs. I look forward to hearing from you soon.\n\nWarm regards,\n%s"
    };

    public String generateDeterministicTemplate(CoverLetterRequest request) {
        // Use a hash of the request to seed the random number generator
        // This ensures the same request always gets the same template, but different requests get different ones.
        String hashString = CacheKeyGenerator.generateHash(
            request.getBackground(), request.getJobDescription(), request.getTone(), request.getJobTitle(), request.getCompany(), request.getQualityMode()
        );
        long seed = hashString.hashCode();
        Random random = new Random(seed);

        String title = request.getJobTitle() != null ? request.getJobTitle() : "open position";
        String company = request.getCompany() != null ? request.getCompany() : "your company";
        String background = request.getBackground() != null ? request.getBackground() : "my field";
        String name = request.getUserName() != null ? request.getUserName() : "Applicant";

        String intro = String.format(INTROS[random.nextInt(INTROS.length)], title, company, background);
        
        // For the body, try to extract a keyword or just use the background again
        String bodyFocus = background;
        if (request.getJobDescription() != null && request.getJobDescription().length() > 20) {
            bodyFocus = "the key skills outlined in your job description";
        }
        
        String body = String.format(BODIES[random.nextInt(BODIES.length)], bodyFocus);
        
        String closing = String.format(CLOSINGS[random.nextInt(CLOSINGS.length)], name);

        return intro + body + closing;
    }
}
