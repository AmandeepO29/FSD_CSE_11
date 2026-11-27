package com.placementtracker.dto.request;

import com.placementtracker.entity.DriveStatus;
import com.placementtracker.entity.JobType;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record PlacementDriveRequest(
    @NotNull(message = "Company is required")
    Long companyId,

    @NotBlank(message = "Job title is required")
    @Size(max = 150)
    String jobTitle,

    @NotBlank(message = "Job description is required")
    @Size(max = 4000)
    String jobDescription,

    @NotNull(message = "Job type is required")
    JobType jobType,

    @NotBlank(message = "Job location is required")
    @Size(max = 150)
    String jobLocation,

    @NotNull(message = "Salary package (LPA) is required")
    @DecimalMin(value = "0.0", message = "Package cannot be negative")
    Double packageLpa,

    @NotNull(message = "Minimum CGPA is required")
    @DecimalMin("0.0")
    @DecimalMax("10.0")
    Double minCgpa,

    @NotNull(message = "Maximum allowed backlogs is required")
    @Min(0)
    @Max(30)
    Integer maxBacklogs,

    @NotBlank(message = "Eligible branches are required")
    String eligibleBranches,

    @NotNull(message = "Passing year is required")
    @Min(2020)
    @Max(2035)
    Integer passingYear,

    @NotNull(message = "Application deadline is required")
    LocalDate applicationDeadline,

    @NotNull(message = "Drive date is required")
    LocalDate driveDate,

    @Size(max = 1500)
    String requiredSkills,

    @Size(max = 1500)
    String selectionProcess,

    DriveStatus status,

    Boolean published
) {}
