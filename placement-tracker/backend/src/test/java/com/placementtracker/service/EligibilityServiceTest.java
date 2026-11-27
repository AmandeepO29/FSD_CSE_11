package com.placementtracker.service;

import com.placementtracker.dto.response.EligibilityResultResponse;
import com.placementtracker.entity.DriveStatus;
import com.placementtracker.entity.PlacementDrive;
import com.placementtracker.entity.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class EligibilityServiceTest {

    private EligibilityService eligibilityService;
    private Student student;
    private PlacementDrive drive;

    @BeforeEach
    void setUp() {
        eligibilityService = new EligibilityService();

        student = new Student();
        student.setBranch("CSE");
        student.setPassingYear(2026);
        student.setCgpa(8.2);
        student.setActiveBacklogs(0);

        drive = new PlacementDrive();
        drive.setPublished(true);
        drive.setStatus(DriveStatus.OPEN);
        drive.setApplicationDeadline(LocalDate.now().plusDays(5));
        drive.setMinCgpa(7.5);
        drive.setMaxBacklogs(0);
        drive.setEligibleBranches("CSE,IT");
        drive.setPassingYear(2026);
    }

    @Test
    void shouldBeEligibleWhenAllCriteriaMatch() {
        EligibilityResultResponse result = eligibilityService.evaluate(student, drive);
        assertTrue(result.eligible());
        assertTrue(result.reasons().isEmpty());
    }

    @Test
    void shouldFailWhenCgpaIsBelowMinimum() {
        student.setCgpa(6.9);
        EligibilityResultResponse result = eligibilityService.evaluate(student, drive);
        assertFalse(result.eligible());
        assertTrue(result.reasons().stream().anyMatch(r -> r.contains("Minimum CGPA")));
    }

    @Test
    void shouldFailWhenBacklogsExceedLimit() {
        student.setActiveBacklogs(1);
        EligibilityResultResponse result = eligibilityService.evaluate(student, drive);
        assertFalse(result.eligible());
        assertTrue(result.reasons().stream().anyMatch(r -> r.contains("backlogs")));
    }

    @Test
    void shouldFailWhenBranchNotEligible() {
        student.setBranch("ME");
        EligibilityResultResponse result = eligibilityService.evaluate(student, drive);
        assertFalse(result.eligible());
        assertTrue(result.reasons().stream().anyMatch(r -> r.contains("Branch ME")));
    }

    @Test
    void shouldPassWhenDriveAllowsAllBranches() {
        student.setBranch("ME");
        drive.setEligibleBranches("ALL");
        EligibilityResultResponse result = eligibilityService.evaluate(student, drive);
        assertTrue(result.eligible());
    }

    @Test
    void shouldFailWhenPassingYearOrDeadlineInvalid() {
        student.setPassingYear(2027);
        drive.setApplicationDeadline(LocalDate.now().minusDays(1));
        drive.setStatus(DriveStatus.CLOSED);

        EligibilityResultResponse result = eligibilityService.evaluate(student, drive);
        assertFalse(result.eligible());
        assertEquals(3, result.reasons().size());
    }
}
