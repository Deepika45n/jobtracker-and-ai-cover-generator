package com.jobtracker.service.ai;

import com.jobtracker.dto.CoverLetterRequest;
import org.springframework.stereotype.Component;

/**
 * Deterministic template fallback provider.
 * Never fails, always returns a result.
 */
@Component
public class TemplateProvider implements AIProvider {

    private final TemplateEngine templateEngine;

    public TemplateProvider(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    @Override
    public String generate(CoverLetterRequest request) throws Exception {
        return templateEngine.generateDeterministicTemplate(request);
    }

    @Override
    public boolean isAvailable() {
        return true; // Always available
    }

    @Override
    public String getProviderName() {
        return "Template Engine";
    }

    @Override
    public int getPriority() {
        return 100; // Always the last resort
    }
}
