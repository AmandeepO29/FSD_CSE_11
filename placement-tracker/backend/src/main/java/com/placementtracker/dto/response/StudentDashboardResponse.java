package com.placementtracker.dto.response;

import java.util.List;

public record StudentDashboardResponse(
    String fullName,
    String enrollmentNumber,
    String branch,
    String section,
    Integer passingYear,
    Double cgpa,
    Integer activeBacklogs,
    int profileCompletion,
    long totalAvailableDrives,
    long eligibleDrives,
    long appliedDrives,
    long selectedOpportunities,
    List<PlacementDriveResponse> recentDrives,
    List<ApplicationResponse> recentApplications
) {}
