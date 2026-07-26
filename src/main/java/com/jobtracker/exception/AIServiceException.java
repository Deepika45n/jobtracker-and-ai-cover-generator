package com.jobtracker.exception;

/**
 * Thrown when all AI providers have been exhausted and no cover letter could be generated.
 * This exception is caught by {@link GlobalExceptionHandler} and returned as a 503 Service Unavailable.
 */
public class AIServiceException extends RuntimeException {

    public AIServiceException(String message) {
        super(message);
    }

    public AIServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
