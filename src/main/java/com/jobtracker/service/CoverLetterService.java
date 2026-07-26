package com.jobtracker.service;

import com.jobtracker.model.CoverLetter;
import com.jobtracker.repository.CoverLetterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CoverLetterService {

    private final CoverLetterRepository repository;

    public CoverLetterService(CoverLetterRepository repository) {
        this.repository = repository;
    }

    public List<CoverLetter> getUserCoverLetters(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public CoverLetter saveCoverLetter(CoverLetter coverLetter) {
        return repository.save(coverLetter);
    }

    public CoverLetter getCoverLetter(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Cover letter not found"));
    }

    public CoverLetter updateCoverLetterText(Long id, String newText) {
        CoverLetter letter = getCoverLetter(id);
        letter.setGeneratedText(newText);
        return repository.save(letter);
    }

    public void deleteCoverLetter(Long id) {
        repository.deleteById(id);
    }

    public CoverLetter duplicateCoverLetter(Long id) {
        CoverLetter original = getCoverLetter(id);
        CoverLetter duplicate = new CoverLetter();
        duplicate.setUserId(original.getUserId());
        duplicate.setCompany(original.getCompany() + " (Copy)");
        duplicate.setRole(original.getRole());
        duplicate.setExperience(original.getExperience());
        duplicate.setAdditionalComment(original.getAdditionalComment());
        duplicate.setGeneratedText(original.getGeneratedText());
        duplicate.setProviderUsed(original.getProviderUsed());
        duplicate.setQualityMode(original.getQualityMode());
        duplicate.setPromptHash(null); // Do not copy hash so it's not confused with generated ones
        return repository.save(duplicate);
    }
}
