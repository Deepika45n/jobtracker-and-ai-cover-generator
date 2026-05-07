package com.jobtracker.controller;

import com.jobtracker.model.JobApplication;
import com.jobtracker.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobApplication>> getUserJobs(@PathVariable Long userId) {
        return ResponseEntity.ok(jobApplicationService.getUserApplications(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<JobApplication> createJob(@PathVariable Long userId, @RequestBody JobApplication jobApplication) {
        jobApplication.setUserId(userId);
        return ResponseEntity.ok(jobApplicationService.createApplication(jobApplication));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateJob(@PathVariable Long id, @RequestBody JobApplication jobApplication) {
        return ResponseEntity.ok(jobApplicationService.updateApplication(id, jobApplication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.ok().build();
    }
}
