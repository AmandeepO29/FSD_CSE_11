package com.placementtracker.dto.request;

import jakarta.validation.constraints.*;

public record AdminCreateStudentRequest(
    @NotBlank(message = "Full name is required")
    String fullName,

    @NotBlank(message = "College email is required")
    @Email(message = "Invalid email format")
    String email,

    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    String password,

    @NotBlank(message = "Enrollment number is required")
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

    @DecimalMin("0.0")
    @DecimalMax("10.0")
    Double cgpa,

    @Min(0)
    @Max(30)
    Integer activeBacklogs,

    String technicalSkills,
    String resumeUrl,
    String linkedinUrl,
    String githubUrl,
    String portfolioUrl
) {}
