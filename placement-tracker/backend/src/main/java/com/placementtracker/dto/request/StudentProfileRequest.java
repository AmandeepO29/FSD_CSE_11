package com.placementtracker.dto.request;

import jakarta.validation.constraints.*;

public record StudentProfileRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 120)
    String fullName,

    @NotBlank(message = "Enrollment number is required")
    @Size(min = 4, max = 40)
    String enrollmentNumber,

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s]{10,15}$", message = "Please enter a valid phone number")
    String phoneNumber,

    @NotBlank(message = "Branch is required")
    String branch,

    @NotBlank(message = "Section is required")
    String section,

    @NotNull(message = "Passing year is required")
    @Min(2020)
    @Max(2035)
    Integer passingYear,

    @NotNull(message = "CGPA is required")
    @DecimalMin(value = "0.0", message = "CGPA cannot be negative")
    @DecimalMax(value = "10.0", message = "CGPA cannot exceed 10.0")
    Double cgpa,

    @NotNull(message = "Active backlogs count is required")
    @Min(value = 0, message = "Active backlogs cannot be negative")
    @Max(value = 30, message = "Active backlogs value is invalid")
    Integer activeBacklogs,

    @Size(max = 1000)
    String technicalSkills,

    @Size(max = 500)
    String resumeUrl,

    @Size(max = 300)
    String linkedinUrl,

    @Size(max = 300)
    String githubUrl,

    @Size(max = 300)
    String portfolioUrl
) {}
