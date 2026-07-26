package com.jobtracker.exception;

/**
 * Thrown when a user exceeds the daily cover letter generation rate limit.
 * Caught by {@link GlobalExceptionHandler} and returned as HTTP 429 Too Many Requests.
 */
public class RateLimitExceededException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceededException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public RateLimitExceededException(String message) {
        super(message);
        this.retryAfterSeconds = 3600; // Default: 1 hour
    }

    /**
     * @return seconds until the user can retry
     */
    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
