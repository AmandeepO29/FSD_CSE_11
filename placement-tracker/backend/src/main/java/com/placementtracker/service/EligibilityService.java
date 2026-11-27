package com.placementtracker.service;

import com.placementtracker.dto.response.EligibilityResultResponse;
import com.placementtracker.entity.DriveStatus;
import com.placementtracker.entity.PlacementDrive;
import com.placementtracker.entity.Student;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EligibilityService {

    public EligibilityResultResponse evaluate(Student student, PlacementDrive drive) {
        List<String> reasons = new ArrayList<>();

        if (!drive.isPublished()) {
            reasons.add("Drive is not currently published");
        }
        if (drive.getStatus() != DriveStatus.OPEN) {
            reasons.add("Drive status is " + drive.getStatus().name() + " (must be OPEN to apply)");
        }
        if (drive.getApplicationDeadline() != null && drive.getApplicationDeadline().isBefore(LocalDate.now())) {
            reasons.add("Application deadline (" + drive.getApplicationDeadline() + ") has passed");
        }

        double studentCgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
        double minCgpa = drive.getMinCgpa() != null ? drive.getMinCgpa() : 0.0;
        if (studentCgpa < minCgpa) {
            reasons.add(String.format("Minimum CGPA required is %.2f (your CGPA: %.2f)", minCgpa, studentCgpa));
        }

        int studentBacklogs = student.getActiveBacklogs() != null ? student.getActiveBacklogs() : 0;
        int maxBacklogs = drive.getMaxBacklogs() != null ? drive.getMaxBacklogs() : 0;
        if (studentBacklogs > maxBacklogs) {
            reasons.add(String.format("Maximum allowed backlogs is %d (yours: %d)", maxBacklogs, studentBacklogs));
        }

        if (!isBranchEligible(student.getBranch(), drive.getEligibleBranches())) {
            reasons.add("Branch " + student.getBranch() + " is not in eligible branches (" + drive.getEligibleBranches() + ")");
        }

        if (drive.getPassingYear() != null && !drive.getPassingYear().equals(student.getPassingYear())) {
            reasons.add("Passing year " + student.getPassingYear() + " does not match required batch " + drive.getPassingYear());
        }

        return new EligibilityResultResponse(reasons.isEmpty(), reasons);
    }

    private boolean isBranchEligible(String studentBranch, String eligibleBranches) {
        if (eligibleBranches == null || eligibleBranches.isBlank()) {
            return true;
        }
        Set<String> allowed = Arrays.stream(eligibleBranches.split(","))
            .map(String::trim)
            .map(String::toUpperCase)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toSet());

        if (allowed.contains("ALL")) {
            return true;
        }
        String normalized = studentBranch == null ? "" : studentBranch.trim().toUpperCase();
        return allowed.contains(normalized);
    }
}
