package com.jobtracker.service;

import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public List<JobApplication> getUserApplications(Long userId) {
        return jobApplicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public JobApplication createApplication(JobApplication jobApplication) {
        return jobApplicationRepository.save(jobApplication);
    }

    public JobApplication updateApplication(Long id, JobApplication jobDetails) {
        JobApplication job = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if(jobDetails.getTitle() != null) job.setTitle(jobDetails.getTitle());
        if(jobDetails.getCompany() != null) job.setCompany(jobDetails.getCompany());
        if(jobDetails.getLocation() != null) job.setLocation(jobDetails.getLocation());
        if(jobDetails.getStatus() != null) job.setStatus(jobDetails.getStatus());
        if(jobDetails.getAppliedDate() != null) job.setAppliedDate(jobDetails.getAppliedDate());
        if(jobDetails.getSalary() != null) job.setSalary(jobDetails.getSalary());
        if(jobDetails.getSource() != null) job.setSource(jobDetails.getSource());
        if(jobDetails.getJobUrl() != null) job.setJobUrl(jobDetails.getJobUrl());
        if(jobDetails.getDescription() != null) job.setDescription(jobDetails.getDescription());
        if(jobDetails.getNotes() != null) job.setNotes(jobDetails.getNotes());

        return jobApplicationRepository.save(job);
    }

    public void deleteApplication(Long id) {
        jobApplicationRepository.deleteById(id);
    }
}
