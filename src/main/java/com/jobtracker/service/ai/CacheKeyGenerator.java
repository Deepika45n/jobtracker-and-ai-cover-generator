package com.jobtracker.service.ai;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Generates SHA-256 cache keys from cover letter request parameters.
 * <p>
 * The hash is computed from the concatenation of: background (resume/skills),
 * job description, tone, job title, and company. This ensures identical
 * requests return cached results without redundant AI API calls.
 * </p>
 */
public final class CacheKeyGenerator {

    private CacheKeyGenerator() {
        // Utility class — no instantiation
    }

    /**
     * Generate a SHA-256 hash from the key request parameters.
     *
     * @param background     user's resume/skills/background
     * @param jobDescription the job description text
     * @param tone           desired tone (Professional, Enthusiastic, etc.)
     * @param jobTitle       the target job title
     * @param company        the target company name
     * @return hex-encoded SHA-256 hash string
     */
    public static String generateHash(String background, String jobDescription,
                                       String tone, String jobTitle, String company, String qualityMode) {
        String input = normalize(background)
                + "|" + normalize(jobDescription)
                + "|" + normalize(tone)
                + "|" + normalize(jobTitle)
                + "|" + normalize(company)
                + "|" + normalize(qualityMode);

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed by the JVM spec — this should never happen
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
