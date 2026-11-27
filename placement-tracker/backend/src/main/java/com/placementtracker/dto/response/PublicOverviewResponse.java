package com.placementtracker.dto.response;

import java.util.List;

public record PublicOverviewResponse(
    long totalStudents,
    long totalCompanies,
    long activeDrives,
    long studentsPlaced,
    double placementPercentage,
    double highestPackageLpa,
    double averagePackageLpa,
    List<PlacementDriveResponse> featuredDrives
) {}
