package com.jobtracker.repository;

import com.jobtracker.model.CoverLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CoverLetterRepository extends JpaRepository<CoverLetter, Long> {
    List<CoverLetter> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<CoverLetter> findByPromptHash(String promptHash);
    
    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime since);
}
