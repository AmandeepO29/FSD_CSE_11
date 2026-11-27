package com.placementtracker.dto.response;

import java.time.LocalDateTime;

public record StudentResponse(
    Long id,
    Long userId,
    String username,
    String email,
    boolean active,
    String fullName,
    String enrollmentNumber,
    String phoneNumber,
    String branch,
    String section,
    Integer passingYear,
    Double cgpa,
    Integer activeBacklogs,
    String technicalSkills,
    String resumeUrl,
    boolean hasUploadedResume,
    String resumeFileName,
    String linkedinUrl,
    String githubUrl,
    String portfolioUrl,
    int profileCompletion,
    int applicationsCount,
    int selectedCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
