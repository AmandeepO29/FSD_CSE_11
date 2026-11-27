package com.placementtracker.dto.response;

import com.placementtracker.entity.ApplicationStatus;
import com.placementtracker.entity.JobType;

import java.time.LocalDateTime;
import java.util.List;

public record ApplicationResponse(
    Long id,
    Long studentId,
    String studentName,
    String enrollmentNumber,
    String studentEmail,
    String branch,
    String section,
    Integer passingYear,
    Double cgpa,
    Integer activeBacklogs,
    boolean hasUploadedResume,
    String resumeUrl,
    Long driveId,
    String jobTitle,
    JobType jobType,
    String jobLocation,
    Double packageLpa,
    Long companyId,
    String companyName,
    ApplicationStatus status,
    String remarks,
    LocalDateTime appliedAt,
    LocalDateTime updatedAt,
    List<ApplicationStatusHistoryResponse> statusHistory
) {}
