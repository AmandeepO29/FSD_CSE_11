package com.placementtracker.controller;

import com.placementtracker.dto.request.ApplicationCreateRequest;
import com.placementtracker.dto.request.ApplicationStatusUpdateRequest;
import com.placementtracker.dto.response.ApplicationResponse;
import com.placementtracker.entity.ApplicationStatus;
import com.placementtracker.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(@Valid @RequestBody ApplicationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.applyForDrive(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ApplicationResponse>> myApplications() {
        return ResponseEntity.ok(applicationService.getMyApplications());
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> listApplications(
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) Long driveId,
        @RequestParam(required = false) String branch,
        @RequestParam(required = false) ApplicationStatus status,
        @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(applicationService.searchApplications(companyId, driveId, branch, status, search));
    }

    @GetMapping("/drive/{driveId}")
    public ResponseEntity<List<ApplicationResponse>> getByDrive(@PathVariable Long driveId) {
        return ResponseEntity.ok(applicationService.searchApplications(null, driveId, null, null, null));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody ApplicationStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, request));
    }
}
