package com.jobtracker.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
public class RateLimitService {

    @Value("${ratelimit.ai.daily-limit:20}")
    private int dailyLimit;

    private final Map<Long, Bucket> cache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(Long userId) {
        return cache.computeIfAbsent(userId, this::newBucket);
    }

    private Bucket newBucket(Long userId) {
        // Refill full amount every day
        Refill refill = Refill.intervally(dailyLimit, Duration.ofDays(1));
        Bandwidth limit = Bandwidth.classic(dailyLimit, refill);
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
    
    public int getRemainingTokens(Long userId) {
        return (int) resolveBucket(userId).getAvailableTokens();
    }
}
