package com.jobtracker.service.ai;

import com.jobtracker.dto.CoverLetterRequest;

/**
 * Strategy interface for AI cover letter providers.
 * <p>
 * Each provider (Gemini, OpenRouter, Template) implements this interface,
 * enabling the {@link AIRouterService} to iterate through providers in
 * priority order with automatic fallback on failure.
 * </p>
 * <p>
 * Providers are auto-discovered by Spring DI and sorted by {@link #getPriority()}.
 * </p>
 */
public interface AIProvider {

    /**
     * Generate a cover letter from the given request.
     *
     * @param request the cover letter request containing all user/job details
     * @return the generated cover letter text
     * @throws Exception if generation fails (triggers fallback to next provider)
     */
    String generate(CoverLetterRequest request) throws Exception;

    /**
     * Check whether this provider is currently available (API key configured, service reachable, etc.).
     *
     * @return true if the provider can accept generation requests
     */
    boolean isAvailable();

    /**
     * A human-readable name for this provider, used in logging and persistence.
     *
     * @return provider name (e.g., "Gemini", "OpenRouter", "Template")
     */
    String getProviderName();

    /**
     * Priority in the fallback chain. Lower values are tried first.
     * <ul>
     *   <li>1 = Gemini (primary)</li>
     *   <li>2 = OpenRouter (secondary)</li>
     *   <li>3 = Template (last resort, always succeeds)</li>
     * </ul>
     *
     * @return priority value
     */
    int getPriority();
}
