package com.placementtracker.dto.response;

import com.placementtracker.entity.DriveStatus;
import com.placementtracker.entity.JobType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PlacementDriveResponse(
    Long id,
    Long companyId,
    String companyName,
    String companyIndustry,
    String companyLocation,
    String companyWebsite,
    String jobTitle,
    String jobDescription,
    JobType jobType,
    String jobLocation,
    Double packageLpa,
    Double minCgpa,
    Integer maxBacklogs,
    String eligibleBranches,
    Integer passingYear,
    LocalDate applicationDeadline,
    LocalDate driveDate,
    String requiredSkills,
    String selectionProcess,
    DriveStatus status,
    boolean published,
    long applicationCount,
    EligibilityResultResponse eligibility,
    boolean alreadyApplied,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
