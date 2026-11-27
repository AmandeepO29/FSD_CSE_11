package com.placementtracker.dto.response;

import java.util.List;

public record AdminDashboardResponse(
    long totalStudents,
    long totalCompanies,
    long activeDrives,
    long totalApplications,
    long studentsPlaced,
    double placementPercentage,
    double averagePackageLpa,
    double highestPackageLpa,
    List<BranchPlacementStat> branchWisePlacements,
    List<CompanyApplicationStat> companyWiseApplications,
    List<MonthlyTrendStat> monthlyPlacementTrends,
    List<StatusStat> selectionStatistics
) {
    public record BranchPlacementStat(String branch, long totalStudents, long placedStudents, double percentage) {}
    public record CompanyApplicationStat(String companyName, long applicationsCount, long selectedCount) {}
    public record MonthlyTrendStat(String month, long applications, long selections) {}
    public record StatusStat(String status, long count) {}
}
